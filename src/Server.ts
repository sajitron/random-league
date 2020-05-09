import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { NOT_FOUND, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import BaseRouter from './routes';
import { logger } from './config/Logger';

dotenv.config();

// Init express
const app = express();

// Add middleware/settings/routes to express.
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
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
app.use('/v1', BaseRouter);

// handle errors

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err: any = new Error('Not Found');
  err.status = NOT_FOUND;
  logger.error(err);
  next(err);
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Request error');
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || INTERNAL_SERVER_ERROR);
  res.json({ status: 'error', message: err });
});

// Export express instance
export default app;
