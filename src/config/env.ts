import dotenv from 'dotenv';

dotenv.config();

interface IEnv {
  port: number;
  mongoURI: string;
  mongoTestURI: string;
  environment: string;
  jwtSecret: string;
  cloudinaryName: string;
  cloudinarySecret: string;
  cloudinaryApiKey: string;
  baseURL: string;
}

const config: IEnv = {
  port: Number(process.env.PORT),
  environment: process.env.NODE_ENV!,
  mongoURI: process.env.MONGO_URI!,
  mongoTestURI: process.env.MONGO_TEST_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  cloudinaryName: process.env.CLOUDINARY_NAME!,
  cloudinarySecret: process.env.CLOUDINARY_SECRET!,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY!,
  baseURL: process.env.BASE_URL!,
};

export class Env {
  static all() {
    return config;
  }
}
