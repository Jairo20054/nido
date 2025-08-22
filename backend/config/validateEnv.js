// config/validateEnv.js
const Joi = require('joi');

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  HOST: Joi.string().default('0.0.0.0'),
  BASE_URL: Joi.string().uri().default('http://localhost:5000'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  TIMEZONE: Joi.string().default('UTC'),

  MONGODB_URI: Joi.string().required(),
  DB_NAME: Joi.string().default('nido'),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRE: Joi.string().default('7d'),
  JWT_REFRESH_EXPIRE: Joi.string().default('30d'),
  BCRYPT_SALT_ROUNDS: Joi.number().default(12),

  COOKIE_SECRET: Joi.string().min(32).required(),
  COOKIE_SECURE: Joi.boolean().default(false),
  COOKIE_HTTP_ONLY: Joi.boolean().default(true),
  COOKIE_SAME_SITE: Joi.string().valid('lax','strict','none').default('lax'),

  EMAIL_SERVICE: Joi.string().allow('', null),
  EMAIL_USER: Joi.string().allow('', null),
  EMAIL_PASS: Joi.string().allow('', null),

  STRIPE_SECRET_KEY: Joi.string().allow('', null),
  STRIPE_PUBLISHABLE_KEY: Joi.string().allow('', null),
  STRIPE_WEBHOOK_SECRET: Joi.string().allow('', null),

  MERCADO_PAGO_ACCESS_TOKEN: Joi.string().allow('', null),

  REDIS_URL: Joi.string().allow('', null),
  REDIS_PASSWORD: Joi.string().allow('', null),
  REDIS_DB: Joi.number().default(0),

  MAX_FILE_SIZE: Joi.number().default(5242880),
  ALLOWED_FILE_TYPES: Joi.string().default('jpg,jpeg,png,gif,webp'),

  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),

  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  LOG_LEVEL: Joi.string().default('info'),
  ENABLE_SWAGGER: Joi.boolean().default(true),
  ENABLE_EMAIL_VERIFICATION: Joi.boolean().default(true),
  ENABLE_PAYMENT_PROCESSING: Joi.boolean().default(true),
  ENABLE_GOOGLE_AUTH: Joi.boolean().default(true),

}).unknown(true); // permite otras variables

function validateEnv() {
  const { error, value } = schema.validate(process.env, { abortEarly: false, allowUnknown: true });
  if (error) {
    console.error('ENV validation error:', error.details.map(d => d.message).join(', '));
    throw new Error('Environment validation error. Check your .env file.');
  }
  // Normalize CORS origins to array
  value.CORS_ORIGINS = value.CORS_ORIGINS ? value.CORS_ORIGINS.split(',').map(s => s.trim()) : [];
  return value;
}

module.exports = validateEnv;
