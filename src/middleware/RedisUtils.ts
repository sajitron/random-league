import util from 'util';
import moment from 'moment';
import { Response, NextFunction } from 'express';
import httpCodes from 'http-status-codes';
import { IRequest } from '../types/custom';
import redisClient from '../config/redis';
import Utils from '../utils/utils';
import { Env } from 'src/config/env';
import { logger } from 'src/config/logger';

const { windowSizeInHours, windowLogInterval, maxWindowRequestCount } = Env.all();

const redisGetAsync = util.promisify(redisClient.get).bind(redisClient);

export const rateLimiter = (req: IRequest, res: Response, next: NextFunction) => {
  const authUser = req.user;
  if (authUser?.role === 'admin') {
    return next();
  }
  try {
    // * check that redis client exists
    if (!redisClient) {
      const errMessage = 'Redis client does not exist!';
      return Utils.errorResponse(res, errMessage, httpCodes.UNPROCESSABLE_ENTITY);
    }
    // * fetch records of current user using IP address, returns null when no record is found
    redisClient.get(authUser?._id!, (err, record) => {
      if (err) {
        return Utils.errorResponse(res, err.message, httpCodes.UNPROCESSABLE_ENTITY);
      }
      const currentRequestTime = moment();
      // *  if no record is found , create a new record for user and store to redis
      if (record == null) {
        const newRecord = [];
        const requestLog = {
          requestTimeStamp: currentRequestTime.unix(),
          requestCount: 1,
        };
        newRecord.push(requestLog);
        redisClient.set(authUser?._id!, JSON.stringify(newRecord));
        return next();
      }
      // * if record is found, parse it's value and calculate number of requests users has made within the last window
      const data = JSON.parse(record);
      const windowStartTimestamp = moment().subtract(windowSizeInHours, 'hours').unix();
      const requestsWithinWindow = data.filter((entry: any) => {
        return entry.requestTimeStamp > windowStartTimestamp;
      });
      const totalWindowRequestsCount = requestsWithinWindow.reduce((accumulator: any, entry: any) => {
        return accumulator + entry.requestCount;
      }, 0);
      // * if number of requests made is greater than or equal to the desired maximum, return error
      if (totalWindowRequestsCount >= maxWindowRequestCount) {
        const errMessage = `You have exceeded the ${maxWindowRequestCount} requests in ${windowSizeInHours} hrs limit!`;
        return Utils.errorResponse(res, errMessage, httpCodes.TOO_MANY_REQUESTS);
      } else {
        // * if number of requests made is less than allowed maximum, log new entry
        const lastRequestLog = data[data.length - 1];
        const potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime
          .subtract(windowLogInterval, 'hours')
          .unix();
        // *  if interval has not passed since last request log, increment counter
        if (lastRequestLog.requestTimeStamp > potentialCurrentWindowIntervalStartTimeStamp) {
          lastRequestLog.requestCount++;
          data[data.length - 1] = lastRequestLog;
        } else {
          // *  if interval has passed, log new entry for current user and timestamp
          data.push({
            requestTimeStamp: currentRequestTime.unix(),
            requestCount: 1,
          });
        }
        redisClient.set(authUser?._id!, JSON.stringify(data));
        return next();
      }
    });
  } catch (error) {
    return next(error);
  }
};

export async function getCache(req: IRequest) {
  const url = req.get('host') + req.originalUrl;

  const data = await redisGetAsync(url);

  if (data) {
    return JSON.parse(data);
  }
}

export function cacheData(req: IRequest, data: any) {
  try {
    const url = req.get('host') + req.originalUrl;
    redisClient.setex(url, 21600, JSON.stringify(data));
    logger.info('Data cached to redis', Date.now());
  } catch (error) {
    logger.error(JSON.stringify(error));
  }
}
