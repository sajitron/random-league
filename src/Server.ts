import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import { NOT_FOUND, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import BaseRouter from './routes';
import { logger } from './config/logger';
import { connectDB } from './config/db';
import { Env } from './config/env';
import Utils from './utils/utils';

const { environment } = Env.all();

// Init express
const app = express();

// Connect database
connectDB();

// Add middleware/settings/routes to express.
const logFormat = environment === 'production' ? 'combined' : 'dev';
app.use(
  morgan(logFormat, {
    skip(req, res) {
      return res.statusCode < 400;
    },
    stream: process.stderr,
  }),
);

app.use(
  morgan(logFormat, {
    skip(req, res) {
      return res.statusCode >= 400;
    },
    stream: process.stdout,
  }),
);

app.disable('x-powered-by');

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route
app.use('/v1', BaseRouter);

// handle errors
// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  const err: any = new Error('Not Found');
  err.status = NOT_FOUND;
  logger.error(err);
  next(err);
});

// error handler
app.use((err: any, req: Request, res: Response) => {
  logger.error(JSON.stringify(err));
  return Utils.errorResponse(res, err.message, err.status || INTERNAL_SERVER_ERROR);
});

// Export express instance
export default app;
