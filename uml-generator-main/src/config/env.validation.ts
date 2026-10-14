import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
  PORT: Joi.number().default(3001),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  AI_API_KEY: Joi.string().optional(),
  LLAMA_BASE_URL: Joi.string().uri().default('http://localhost:11434'),
  LLAMA_MODEL: Joi.string().default('llama3-mermaid-uml'),
  USE_LLAMA: Joi.boolean().default(false),
});
