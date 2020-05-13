// tslint:disable: no-shadowed-variable
import { Request, Response } from 'express';
import { IRequest } from '../types/custom';
import httpCodes from 'http-status-codes';
import UserService from '../services/UserService';
import Utils from '../utils/utils';
import { getCache, cacheData } from '../middleware/RedisUtils';
import { CreateUserSchema, UpdateUserSchema, UserAuthSchema } from './validations/User';
import { logger } from '../config/logger';

export async function newUser(req: Request, res: Response) {
  try {
    // * validate req object
    const errors = await Utils.validateRequest(req.body, CreateUserSchema);
    if (errors) {
      return Utils.errorResponse(res, errors, httpCodes.BAD_REQUEST);
    }
    // * check if user exists
    const existingUser = await UserService.getUserByEmail(req.body.email);
    if (existingUser) {
      const errMessage = 'User already exists';
      return Utils.errorResponse(res, errMessage, httpCodes.CONFLICT);
    }
    const userObject = req.body;

    // * check if image is part of request
    if (req.file) {
      userObject.avatar_url = await UserService.uploadImage(req);
    }
    // * hash password
    userObject.password = await Utils.hashPassword(req.body.password);

    userObject.email = userObject.email.toLowerCase();

    // * create user
    const user = await UserService.createUser(userObject);

    // * create token
    const token = Utils.generateToken(user, 604800);

    const message = 'User created successfully';
    // * return newly created user
    return Utils.successResponse(res, { user, token }, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function authUser(req: Request, res: Response) {
  try {
    const errors = await Utils.validateRequest(req.body, UserAuthSchema);
    if (errors) {
      return Utils.errorResponse(res, errors, httpCodes.BAD_REQUEST);
    }
    // * check if user exists
    const user: any = await UserService.getUserByEmail(req.body.email);
    if (!user) {
      const errMessage = 'Account does not exist';
      return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
    }
    const passwordMatch = await Utils.validatePassword(req.body.password, user.password);
    if (!passwordMatch) {
      const errMessage = 'Incorrect password';
      return Utils.errorResponse(res, errMessage, httpCodes.UNAUTHORIZED);
    }
    const token = Utils.generateToken(user, 604800);

    const message = 'User login successful';
    return Utils.successResponse(res, { user, token }, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function getUser(req: Request, res: Response) {
  const userID = req.params.id;
  try {
    const cacheUser = await getCache(req);
    if (cacheUser) {
      const message = 'User returned successfully';
      return Utils.successResponse(res, { user: cacheUser }, message, httpCodes.OK);
    }
    const user = await UserService.getUserByID(userID);
    if (!user) {
      const errMessage = 'user does not exist';
      return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
    }
    cacheData(req, user);
    const message = 'User returned successfully';
    return Utils.successResponse(res, { user }, message, httpCodes.OK);
  } catch (error) {
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function getAllUsers(req: IRequest, res: Response) {
  const authUser = req.user;

  if (authUser?.role !== 'admin') {
    const errMessage = 'Unauthorized request';
    return Utils.errorResponse(res, errMessage, httpCodes.UNAUTHORIZED);
  }

  try {
    const cacheUsers = await getCache(req);
    if (cacheUsers) {
      const message = 'Users returned successfully';
      return Utils.successResponse(res, { users: cacheUsers }, message, httpCodes.OK);
    }
    const users = await UserService.getUsers();
    if (!users) {
      const errMessage = 'users do not exist';
      return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
    }
    cacheData(req, users);
    const message = 'Users returned successfully';
    return Utils.successResponse(res, { users }, message, httpCodes.OK);
  } catch (error) {
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function updateUser(req: IRequest, res: Response) {
  try {
    const userID = req.params.id;
    const authUser = req.user;

    if (userID.toString() !== authUser?._id.toString() && authUser?.role !== 'admin') {
      const errMessage = 'Unauthorized request';
      return Utils.errorResponse(res, errMessage, httpCodes.UNAUTHORIZED);
    }

    // * validate req object
    const errors = await Utils.validateRequest(req.body, UpdateUserSchema);
    if (errors) {
      return Utils.errorResponse(res, errors, httpCodes.BAD_REQUEST);
    }

    const existingUser = await UserService.getUserByID(userID);
    if (!existingUser) {
      const errMessage = 'user does not exist';
      return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
    }

    const userObject: any = {
      updated_at: Date.now(),
    };

    // * only admins should change a user role to admin
    if (req.body.role) {
      if (authUser?.role === 'admin') {
        userObject.role = req.body.role;
      } else {
        return Utils.errorResponse(res, 'Unauthorized request', httpCodes.UNAUTHORIZED);
      }
    }
    if (req.body.first_name) {
      userObject.first_name = req.body.first_name;
    }
    if (req.body.last_name) {
      userObject.last_name = req.body.last_name;
    }
    if (req.body.email) {
      userObject.email = req.body.email.toLowerCase();
    }
    if (req.body.password) {
      userObject.password = await Utils.hashPassword(req.body.password);
    }
    // * check if image is part of request
    if (req.file) {
      userObject.avatar_url = await UserService.uploadImage(req);
    }

    // * update user
    const user = await UserService.updateUser(userID, userObject);

    const message = 'User updated successfully';
    // * return newly created user
    return Utils.successResponse(res, { user }, message, httpCodes.OK);
  } catch (error) {
    logger.error(JSON.stringify(error));
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function removeUser(req: IRequest, res: Response) {
  const authUser = req.user;
  const userID = req.params.id;

  // * check if user exists
  const user = await UserService.getUserByID(userID);

  if (!user) {
    const errMessage = 'User does not exist';
    return Utils.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
  }

  if (authUser?.role !== 'admin' && authUser?._id.toString() !== userID.toString()) {
    const errMessage = 'Unauthorized request';
    return Utils.errorResponse(res, errMessage, httpCodes.UNAUTHORIZED);
  }

  try {
    const response = await UserService.removeUser(userID);
    const message = 'User removed successfully';
    return Utils.successResponse(res, response, message, httpCodes.OK);
  } catch (error) {
    return Utils.errorResponse(res, error.message, httpCodes.INTERNAL_SERVER_ERROR);
  }
}
