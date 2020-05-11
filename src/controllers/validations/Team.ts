import Joi from '@hapi/joi';

export const CreateTeamSchema = Joi.object({
  team_name: Joi.string().required(),
  team_logo: Joi.string(),
  coach: Joi.string().required(),
  stadium: Joi.string().required(),
});

export const UpdateTeamSchema = Joi.object({
  team_name: Joi.string(),
  team_logo: Joi.string(),
  coach: Joi.string(),
  stadium: Joi.string(),
});
