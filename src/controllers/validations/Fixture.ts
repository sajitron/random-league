import Joi from '@hapi/joi';

export const CreateFixtureSchema = Joi.object({
  home_team: Joi.string().required(),
  away_team: Joi.string().required(),
  match_date: Joi.date().required(),
  venue: Joi.string().required(),
  scores: Joi.object().keys({
    home_team: Joi.number().required(),
    away_team: Joi.number().required(),
  }),
});

export const UpdateFixtureSchema = Joi.object({
  home_team: Joi.string(),
  away_team: Joi.string(),
  match_date: Joi.date(),
  completed: Joi.boolean(),
  venue: Joi.string(),
  scores: Joi.object().keys({
    home_team: Joi.number(),
    away_team: Joi.number(),
  }),
  link: Joi.string(),
});
