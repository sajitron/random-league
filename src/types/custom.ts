import { Request } from 'express';
export interface IRequest extends Request {
  user?: {
    _id: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}
