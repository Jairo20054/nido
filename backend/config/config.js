// config/index.js
require('dotenv').config();
const Joi = require('joi');

// 📌 Definir el esquema de validación de las variables de entorno
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test', 'staging').default('development'),

  PORT: Joi.number().default(5000),
  HOST: Joi.string().default('0.0.0.0'),

  DB_TYPE: Joi.string().valid('mongodb').default('mongodb'),
  MONGODB_URI: Joi.string().uri().required(),

  JWT_SECRET: Joi.string().min(12).required(),
  JWT_EXPIRATION: Joi.string().default('24h'),

  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: Joi.boolean().truthy('true').falsy('false').default(true),

  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_PRETTY: Joi.boolean().truthy('true').falsy('false').default(false),

  GEOLOCATION_API_KEY: Joi.string().allow(''),

  STRIPE_SECRET_KEY: Joi.string().allow(''),
  STRIPE_PUBLISHABLE_KEY: Joi.string().allow(''),

  RATE_LIMIT_MAX: Joi.number().default(100),
  RATE_LIMIT_WINDOW: Joi.string().default('15m'),
}).unknown(); // permite otras variables que no estén en el schema

// 📌 Validar el archivo .env
const { value: env, error } = envSchema.validate(process.env, { abortEarly: false });
if (error) {
  throw new Error(`❌ Config validation error: ${error.message}`);
}

// 📌 Configuración centralizada
const config = Object.freeze({
  env: env.NODE_ENV,

  // 🌐 Servidor
  server: {
    port: env.PORT,
    host: env.HOST,
  },

  // 🗄️ Base de datos
  database: {
    type: env.DB_TYPE,
    mongodb: {
      uri: env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
  },

  // 🔐 Autenticación
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiration: env.JWT_EXPIRATION,
  },

  // 🔓 CORS
  cors: {
    origin: env.CORS_ORIGIN.split(','),
    credentials: env.CORS_CREDENTIALS,
  },

  // 📝 Logging
  logging: {
    level: env.LOG_LEVEL,
    pretty: env.LOG_PRETTY,
  },

  // 🌍 APIs externas
  api: {
    geolocation: {
      apiKey: env.GEOLOCATION_API_KEY,
    },
    payment: {
      stripe: {
        secretKey: env.STRIPE_SECRET_KEY,
        publishableKey: env.STRIPE_PUBLISHABLE_KEY,
      },
    },
  },

  // 🚦 Rate limiting (ejemplo para Express)
  rateLimit: {
    max: env.RATE_LIMIT_MAX,
    window: env.RATE_LIMIT_WINDOW,
  },

  // ⚙️ Flags de características (ejemplo)
  features: {
    enableNewUI: env.NODE_ENV !== 'production',
  },
});

module.exports = config;