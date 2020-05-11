// tslint:disable: no-shadowed-variable
import { Request, Response } from 'express';
import { IRequest } from '../types/custom';
import httpCodes from 'http-status-codes';
import TeamService from '../services/TeamService';
import UserService from '../services/UserService';
import Utils from '../utils/utils';
import { getCache, cacheData } from '../middleware/RedisUtils';
import { CreateTeamSchema, UpdateTeamSchema } from './validations/Team';
import { logger } from 'src/config/logger';

export async function newTeam(req: IRequest, res: Response) {
  try {
    const errors = await Utils.validateRequest(req.body, CreateTeamSchema);
    if (errors) {
      return Utils.errorResponse(res, errors, httpCodes.BAD_REQUEST);
    }
    const existingTeam = await TeamService.getTeamByName(req.body.team_name.toLowerCase());
    if (existingTeam) {
      const errMessage = 'Team already exists';
      return Utils.errorResponse(res, errMessage, httpCodes.CONFLICT);
    }
    const teamObject = req.body;
    teamObject.team_name = teamObject.team_name.toLowerCase();
    teamObject.stadium = teamObject.stadium.toLowerCase();
    teamObject.coach = teamObject.coach.toLowerCase();
    teamObject.creator = req.user?._id;

    if (req.file) {
      teamObject.team_logo = await UserService.uploadImage(req);
    }

    const team = await TeamService.createTeam(teamObject);

    const message = 'Team created successfully';

    return Utils.successResponse(res, { team }, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function getTeam(req: Request, res: Response) {
  const teamID = req.params.id;
  try {
    const cacheTeam = await getCache(req);
    if (cacheTeam) {
      const message = 'Fixture returned successfully';
      return Utils.successResponse(res, { team: cacheTeam }, message, httpCodes.OK);
    }
    const team = await TeamService.getTeamByID(teamID);
    if (!team) {
      const errMessage = 'team does not exist';
      return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
    }
    cacheData(req, team);
    const message = 'Team returned successfully';
    return Utils.successResponse(res, { team }, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.NOT_FOUND);
  }
}

export async function getAllTeams(req: IRequest, res: Response) {
  try {
    const cacheTeams = await getCache(req);
    if (cacheTeams) {
      const message = 'Fixture returned successfully';
      return Utils.successResponse(res, { teams: cacheTeams }, message, httpCodes.OK);
    }
    const teams = await TeamService.getTeams();
    if (!teams.length) {
      const errMessage = 'teams do not exist';
      return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
    }
    cacheData(req, teams);
    const message = 'Teams returned successfully';
    return Utils.successResponse(res, { teams }, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function updateTeam(req: IRequest, res: Response) {
  try {
    const teamID = req.params.id;
    const errors = await Utils.validateRequest(req.body, UpdateTeamSchema);
    if (errors) {
      return Utils.errorResponse(res, errors, httpCodes.BAD_REQUEST);
    }

    const teamExists = await TeamService.getTeamByID(teamID);
    if (!teamExists) {
      const errMessage = 'team does not exist';
      return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
    }

    const teamObject: any = {
      updated_at: Date.now(),
    };

    if (req.body.team_name) {
      const existingTeam = await TeamService.getTeamByName(req.body.team_name.toLowerCase());
      if (existingTeam) {
        const errMessage = 'Team already exists';
        return Utils.errorResponse(res, errMessage, httpCodes.CONFLICT);
      }
      teamObject.team_name = req.body.team_name.toLowerCase();
    }
    if (req.body.coach) {
      teamObject.coach = req.body.coach.toLowerCase();
    }
    if (req.body.stadium) {
      teamObject.stadium = req.body.stadium.toLowerCase();
    }
    if (req.file) {
      teamObject.team_logo = await UserService.uploadImage(req);
    }
    const team = await TeamService.updateTeam(teamID, teamObject);

    const message = 'Team updated successfully';
    return Utils.successResponse(res, { team }, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function removeTeam(req: IRequest, res: Response) {
  const teamID = req.params.id;
  const team = await TeamService.getTeamByID(teamID);

  if (!team) {
    const errMessage = 'Team does not exist';
    return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
  }

  try {
    const response = await TeamService.removeTeam(teamID);
    const message = 'Team removed successfully';
    return Utils.successResponse(res, response, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function search(req: Request, res: Response) {
  const searchString = req.params.search;
  try {
    const cacheResult = await getCache(req);
    if (cacheResult) {
      const message = 'Fixture returned successfully';
      return Utils.successResponse(res, { ...cacheResult }, message, httpCodes.OK);
    }
    const result = await TeamService.search(searchString);
    cacheData(req, result);
    const message = 'Search results returned';
    return Utils.successResponse(res, { ...result }, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.NOT_FOUND);
  }
}
