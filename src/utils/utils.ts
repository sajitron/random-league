import { Response } from 'express';
import Joi from '@hapi/joi';
import jwt from 'jsonwebtoken';
import cloudinary from 'cloudinary';
import multer from 'multer';
import { Env } from '../config/env';
import bcrypt from 'bcryptjs';

const { jwtSecret, cloudinaryApiKey, cloudinaryName, cloudinarySecret, baseURL } = Env.all();

cloudinary.v2.config({
  cloud_name: cloudinaryName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinarySecret,
});

const storage = multer.memoryStorage();

const Utils = {
  async errorResponse(res: Response, message = '', statusCode = 500) {
    return res.status(statusCode).send({
      status: 'error',
      message,
    });
  },

  async successResponse(res: Response, data: any = {}, message = '', statusCode = 200) {
    return res.status(statusCode).send({
      status: 'success',
      message,
      data,
    });
  },

  async validateRequest(requestBody: any, validationSchema: Joi.Schema) {
    const errors = validationSchema.validate(requestBody);

    if (errors.error) {
      return errors.error.details[0].message;
    }
  },

  generateToken(user: any, expiry: any): string {
    const tokenData = {
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        _id: user._id,
      },
    };
    const token = jwt.sign(tokenData, jwtSecret, {
      expiresIn: expiry,
      issuer: 'random-guys',
    });
    return token;
  },

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  },

  async validatePassword(password: string, passwordHash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      return false;
    }
    return true;
  },

  verifyToken(token: string): any {
    try {
      const decoded = jwt.verify(token, jwtSecret);
      return decoded;
    } catch (error) {
      throw new Error('Invalid Token');
    }
  },

  bufferToDataUri(buffer: Buffer) {
    const buf = Buffer.from(buffer);
    const base64Data = buf.toString('base64');
    const imageURI = 'data:image/png;base64,' + base64Data;
    return imageURI;
  },

  uploads: multer({ storage }).single('avatar'),

  uploader: cloudinary.v2.uploader,

  generateLink() {
    const codeLength = 8;
    const digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';

    for (let i = 1; i <= codeLength; i++) {
      const index = Math.floor(Math.random() * digits.length);
      code = code + digits[index];
    }

    const fixtureLink = `${baseURL}/v1/fixtures/link/${code}`;

    return fixtureLink;
  },
};

export default Utils;
