import Joi from '@hapi/joi';

export const CreateUserSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  avatar_url: Joi.string(),
  email: Joi.string().required().lowercase().email(),
  password: Joi.string().required().min(8),
  role: Joi.string(),
});

export const UpdateUserSchema = Joi.object({
  first_name: Joi.string(),
  last_name: Joi.string(),
  avatar_url: Joi.string(),
  email: Joi.string().lowercase().email(),
  password: Joi.string().min(8),
  role: Joi.string(),
});

export const UserAuthSchema = Joi.object({
  email: Joi.string().required().lowercase().email(),
  password: Joi.string().required().min(8),
});
