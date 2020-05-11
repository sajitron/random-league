// tslint:disable: no-shadowed-variable
import { Request, Response } from 'express';
import { IRequest } from '../types/custom';
import httpCodes from 'http-status-codes';
import moment from 'moment';
import FixtureService from '../services/FixtureService';
import TeamService from '../services/TeamService';
import Utils from '../utils/utils';
import { getCache, cacheData } from '../middleware/RedisUtils';
import { CreateFixtureSchema, UpdateFixtureSchema } from './validations/Fixture';
import { logger } from 'src/config/logger';

export async function newFixture(req: IRequest, res: Response) {
  try {
    const errors = await Utils.validateRequest(req.body, CreateFixtureSchema);
    if (errors) {
      return Utils.errorResponse(res, errors, httpCodes.BAD_REQUEST);
    }
    // * a team cannot play against itself
    if (req.body.home_team === req.body.away_team) {
      const errMessage = 'same teams cannot play a fixture';
      return Utils.errorResponse(res, errMessage, httpCodes.CONFLICT);
    }
    // * check if there is another fixture at the same venue on the same day
    const existingFixtures = await FixtureService.getFixtureByVenue(req.body.venue.toLowerCase());

    if (existingFixtures) {
      const sameDateFixtures = existingFixtures.filter((fixture: any) => {
        return moment(fixture.match_date).isSame(req.body.match_date, 'date') === true;
      });

      if (sameDateFixtures.length) {
        const errMessage = 'existing fixture on the same date';
        return Utils.errorResponse(res, errMessage, httpCodes.CONFLICT);
      }
    }
    // * generate link and add to req body
    const link = Utils.generateLink();

    const fixtureObject = {
      ...req.body,
      venue: req.body.venue.toLowerCase(),
      link,
    };

    const homeTeam: any = await TeamService.getTeamByID(req.body.home_team);
    const awayTeam: any = await TeamService.getTeamByID(req.body.away_team);

    if (!homeTeam || !awayTeam) {
      const errMessage = 'one or both teams does not exist';
      return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
    }

    const fixture = await FixtureService.createFixture(fixtureObject);

    // * add fixtures to teams
    TeamService.updateTeam(req.body.home_team, { fixtures: [...homeTeam.fixtures, fixture._id] });
    TeamService.updateTeam(req.body.away_team, { fixtures: [...awayTeam.fixtures, fixture._id] });

    const message = 'Fixture created successfully';

    return Utils.successResponse(res, { fixture }, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function getFixtureByLink(req: Request, res: Response) {
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  try {
    const cacheFixture = await getCache(req);
    if (cacheFixture) {
      const message = 'Fixture returned successfully';
      return Utils.successResponse(res, { fixture: cacheFixture }, message, httpCodes.OK);
    }
    const fixture = await FixtureService.getFixtureByLink(url);
    if (!fixture) {
      const errMessage = 'fixture does not exist';
      return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
    }
    cacheData(req, fixture);
    const message = 'Fixture returned successfully';
    return Utils.successResponse(res, { fixture }, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function getFixture(req: Request, res: Response) {
  const fixtureID = req.params.id;
  try {
    const cacheFixture = await getCache(req);
    if (cacheFixture) {
      const message = 'Fixture returned successfully';
      return Utils.successResponse(res, { fixture: cacheFixture }, message, httpCodes.OK);
    }
    const fixture = await FixtureService.getFixtureByID(fixtureID);
    if (!fixture) {
      const errMessage = 'fixture does not exist';
      return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
    }
    cacheData(req, fixture);
    const message = 'Fixture returned successfully';
    return Utils.successResponse(res, { fixture }, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function getAllFixtures(req: Request, res: Response) {
  try {
    const cacheFixtures = await getCache(req);
    if (cacheFixtures) {
      const message = 'Fixture returned successfully';
      return Utils.successResponse(res, { fixtures: cacheFixtures }, message, httpCodes.OK);
    }
    const fixtures = await FixtureService.getFixtures();
    if (!fixtures) {
      const errMessage = 'fixtures do not exist';
      return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
    }
    cacheData(req, fixtures);
    const message = 'Fixture returned successfully';
    return Utils.successResponse(res, { fixtures }, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function getCompletedFixtures(req: Request, res: Response) {
  try {
    const cacheFixtures = await getCache(req);
    if (cacheFixtures) {
      const message = 'Fixture returned successfully';
      return Utils.successResponse(res, { fixtures: cacheFixtures }, message, httpCodes.OK);
    }
    const fixtures = await FixtureService.getFixtureByStatus(true);
    if (!fixtures) {
      const errMessage = 'no completed fixtures';
      return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
    }
    cacheData(req, fixtures);
    const message = 'Completed Fixtures returned successfully';
    return Utils.successResponse(res, { fixtures }, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function getPendingFixtures(req: Request, res: Response) {
  try {
    const cacheFixtures = await getCache(req);
    if (cacheFixtures) {
      const message = 'Fixture returned successfully';
      return Utils.successResponse(res, { fixtures: cacheFixtures }, message, httpCodes.OK);
    }
    const fixtures = await FixtureService.getFixtureByStatus(false);
    if (!fixtures) {
      const errMessage = 'no pending fixtures';
      return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
    }
    cacheData(req, fixtures);
    const message = 'Completed Fixtures returned successfully';
    return Utils.successResponse(res, { fixtures }, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function updateFixture(req: IRequest, res: Response) {
  try {
    const fixtureID = req.params.id;
    const errors = await Utils.validateRequest(req.body, UpdateFixtureSchema);
    if (errors) {
      return Utils.errorResponse(res, errors, httpCodes.BAD_REQUEST);
    }

    const fixtureExists: any = await FixtureService.getFixtureByID(fixtureID);
    if (!fixtureExists) {
      const errMessage = 'fixture does not exist';
      return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
    }

    const fixtureObject: any = {
      updated_at: Date.now(),
    };

    if (req.body.home_team && req.body.away_team) {
      if (req.body.home_team === req.body.away_team) {
        const errMessage = 'same teams cannot play a fixture';
        return Utils.errorResponse(res, errMessage, httpCodes.CONFLICT);
      }
    }

    if (req.body.venue) {
      const existingFixtures = await FixtureService.getFixtureByVenue(req.body.venue.toLowerCase());

      if (existingFixtures && req.body.match_date) {
        const sameDateFixtures = existingFixtures.filter((fixture: any) => {
          return moment(fixture.match_date).isSame(req.body.match_date, 'date') === true;
        });

        if (sameDateFixtures.length) {
          const errMessage = 'existing fixture on the same date';
          return Utils.errorResponse(res, errMessage, httpCodes.CONFLICT);
        }
      }

      fixtureObject.venue = req.body.venue.toLowerCase();
    }

    const fixture = await FixtureService.updateFixture(fixtureID, { ...req.body, ...fixtureObject });

    const message = 'Fixture updated successfully';
    return Utils.successResponse(res, { fixture }, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function removeFixture(req: IRequest, res: Response) {
  const fixtureID = req.params.id;
  const fixture = await FixtureService.getFixtureByID(fixtureID);

  if (!fixture) {
    const errMessage = 'Fixture does not exist';
    return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
  }

  try {
    const response = await FixtureService.removeFixture(fixtureID);
    const message = 'Fixture removed successfully';
    return Utils.successResponse(res, response, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}
