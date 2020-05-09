import dotenv from 'dotenv';

dotenv.config();

interface IEnv {
  port: number;
  mongoURI: string;
  mongoTestURI: string;
  environment: string;
  jwtSecret: string;
}

const config: IEnv = {
  port: Number(process.env.PORT),
  environment: process.env.NODE_ENV!,
  mongoURI: process.env.MONGO_URI!,
  mongoTestURI: process.env.MONGO_TEST_URI!,
  jwtSecret: process.env.JWT_SECRET!,
};

export class Env {
  static all() {
    return config;
  }
}
