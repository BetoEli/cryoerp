import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Server
  NODE_ENV: Joi.string()
    .valid('develop', 'production', 'test')
    .default('develop'),
  PORT: Joi.number().default(4000),

  // Database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),

  // Authentication
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRATION: Joi.string().default('30m'),
  CSRF_SECRET: Joi.string().min(16).required(),

  // API Keys
  API_KEYS: Joi.string().required(),
  MAINTENANCE_API_KEY: Joi.string().min(16).required(),
});
