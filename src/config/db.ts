import mongoose from 'mongoose';
import { Env } from './env';
import { logger } from './Logger';

const { environment, mongoURI, mongoTestURI } = Env.all();

const dbURI = environment === 'test' ? mongoTestURI : mongoURI;

export const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    logger.info('MongoDB Connected...');
  } catch (err) {
    logger.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};
