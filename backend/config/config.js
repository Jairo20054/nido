// config/index.js
require('dotenv').config();
const Joi = require('joi');

// 📦 ESQUEMA DE VALIDACIÓN DE VARIABLES DE ENTORNO
const envSchema = Joi.object({
  // 🎯 ENTORNO
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  
  // 🌐 SERVIDOR
  PORT: Joi.number().default(5000),
  HOST: Joi.string().default('0.0.0.0'),
  
  // 🗄️ BASE DE DATOS MONGODB
  MONGODB_URI: Joi.string()
    .uri()
    .default('mongodb://localhost:27017/nido')
    .description('URI de conexión de MongoDB'),
  MONGODB_POOL_SIZE: Joi.number().default(10),
  MONGODB_CONNECTION_TIMEOUT: Joi.number().default(30000),
  MONGODB_SOCKET_TIMEOUT: Joi.number().default(45000),
  
  // 🔐 AUTENTICACIÓN JWT
  JWT_SECRET: Joi.string().min(12).required(),
  JWT_EXPIRATION: Joi.string().default('24h'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
  JWT_ALGORITHM: Joi.string().default('HS256'),
  
  // 🌍 CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(true),
  CORS_ALLOWED_METHODS: Joi.string().default('GET,POST,PUT,PATCH,DELETE,OPTIONS'),
  CORS_ALLOWED_HEADERS: Joi.string().default('Content-Type,Authorization,X-Requested-With'),
  
  // 🚦 RATE LIMITING
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  
  // 🛡️ SEGURIDAD
  SECURITY_HEADERS_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(true),
  
  // 📝 LOGGING
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'trace')
    .default('info'),
  LOG_PRETTY: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),
  LOG_FILE_PATH: Joi.string().default('./logs'),
  LOG_FILE_MAX_SIZE: Joi.string().default('10m'),
  LOG_FILE_MAX_FILES: Joi.string().default('14d'),
  
  // 🗺️ APIs EXTERNAS
  GEOLOCATION_API_KEY: Joi.string().allow(''),
  GEOLOCATION_PROVIDER: Joi.string().default('google'),
  
  // 💳 STRIPE
  STRIPE_SECRET_KEY: Joi.string().allow(''),
  STRIPE_PUBLISHABLE_KEY: Joi.string().allow(''),
  STRIPE_WEBHOOK_SECRET: Joi.string().allow(''),
  
  // 📧 EMAIL
  EMAIL_SERVICE: Joi.string().default('gmail'),
  EMAIL_HOST: Joi.string().default('smtp.gmail.com'),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_USER: Joi.string().allow(''),
  EMAIL_PASSWORD: Joi.string().allow(''),
  
  // ☁️ ALMACENAMIENTO EN LA NUBE
  CLOUD_STORAGE_PROVIDER: Joi.string().default('local'),
  AWS_ACCESS_KEY_ID: Joi.string().allow(''),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow(''),
  AWS_REGION: Joi.string().default('us-east-1'),
  S3_BUCKET_NAME: Joi.string().allow(''),
  
  // ⚙️ CONFIGURACIÓN DE LA APLICACIÓN
  UPLOAD_LIMIT: Joi.string().default('10mb'),
  SESSION_TIMEOUT: Joi.number().default(3600000),
  PASSWORD_RESET_TIMEOUT: Joi.number().default(3600000),
  
  // 🚩 FLAGS DE FUNCIONALIDADES
  FEATURE_USER_REGISTRATION: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(true),
  FEATURE_EMAIL_VERIFICATION: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),
  FEATURE_PAYMENTS: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),
  
  // 🗃️ CACHÉ
  REDIS_URL: Joi.string().uri().allow(''),
  CACHE_TTL: Joi.number().default(3600),
  QUERY_CACHE_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),
})
  .unknown()
  .with('STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY')
  .with('EMAIL_USER', 'EMAIL_PASSWORD')
  .with('AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY');

// 🔍 EJECUTAR VALIDACIÓN
const { value: env, error } = envSchema.validate(process.env, {
  abortEarly: false,
  stripUnknown: true,
});

// ❗ MANEJO DE ERRORES DE VALIDACIÓN
if (error) {
  const errorMsg = `Error de configuración:
${error.details.map((d) => `- ${d.message}`).join('\n')}`;
  
  if (env && env.NODE_ENV === 'production') {
    throw new Error(errorMsg);
  } else {
    console.warn(`⚠️  Advertencia de configuración: ${errorMsg}`);
  }
}

// 🛠️ CONFIGURACIÓN CENTRALIZADA
const config = Object.freeze({
  // 🎯 ENTORNO
  env: env.NODE_ENV,
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  isStaging: env.NODE_ENV === 'staging',

  // 🌐 SERVIDOR
  server: {
    port: env.PORT,
    host: env.HOST,
    baseUrl: `${env.HOST}:${env.PORT}`,
    uploadLimit: env.UPLOAD_LIMIT,
    sessionTimeout: env.SESSION_TIMEOUT,
    passwordResetTimeout: env.PASSWORD_RESET_TIMEOUT,
  },

  // 🗄️ BASE DE DATOS
  database: {
    uri: env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: env.MONGODB_CONNECTION_TIMEOUT,
      socketTimeoutMS: env.MONGODB_SOCKET_TIMEOUT,
      maxPoolSize: env.MONGODB_POOL_SIZE,
      minPoolSize: 1,
    },
    redis: {
      url: env.REDIS_URL || null,
      ttl: env.CACHE_TTL,
    },
    queryCacheEnabled: env.QUERY_CACHE_ENABLED,
  },

  // 🔐 AUTENTICACIÓN
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiration: env.JWT_EXPIRATION,
    jwtRefreshExpiration: env.JWT_REFRESH_EXPIRATION,
    jwtAlgorithm: env.JWT_ALGORITHM,
  },

  // 🌍 CORS
  cors: {
    origin: env.CORS_ORIGIN.split(','),
    credentials: env.CORS_CREDENTIALS,
    methods: env.CORS_ALLOWED_METHODS.split(','),
    allowedHeaders: env.CORS_ALLOWED_HEADERS.split(','),
  },

  // 🚦 RATE LIMITING
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
  },

  // 🛡️ SEGURIDAD
  security: {
    headersEnabled: env.SECURITY_HEADERS_ENABLED,
  },

  // 📝 LOGGING
  logging: {
    level: env.LOG_LEVEL,
    pretty: env.LOG_PRETTY,
    filePath: env.LOG_FILE_PATH,
    fileMaxSize: env.LOG_FILE_MAX_SIZE,
    fileMaxFiles: env.LOG_FILE_MAX_FILES,
  },

  // 🗺️ APIs EXTERNAS
  api: {
    geolocation: {
      apiKey: env.GEOLOCATION_API_KEY || null,
      provider: env.GEOLOCATION_PROVIDER,
    },
    stripe: {
      secretKey: env.STRIPE_SECRET_KEY || null,
      publishableKey: env.STRIPE_PUBLISHABLE_KEY || null,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET || null,
    },
  },

  // 📧 EMAIL
  email: {
    service: env.EMAIL_SERVICE,
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    user: env.EMAIL_USER || null,
    password: env.EMAIL_PASSWORD || null,
    secure: env.EMAIL_PORT === 465,
  },

  // ☁️ ALMACENAMIENTO
  storage: {
    provider: env.CLOUD_STORAGE_PROVIDER,
    aws: {
      accessKeyId: env.AWS_ACCESS_KEY_ID || null,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY || null,
      region: env.AWS_REGION,
      s3Bucket: env.S3_BUCKET_NAME || null,
    },
  },

  // ⚙️ CARACTERÍSTICAS
  features: {
    userRegistration: env.FEATURE_USER_REGISTRATION,
    emailVerification: env.FEATURE_EMAIL_VERIFICATION,
    payments: env.FEATURE_PAYMENTS,
    geolocation: !!env.GEOLOCATION_API_KEY,
    stripe: !!(env.STRIPE_SECRET_KEY && env.STRIPE_PUBLISHABLE_KEY),
    email: !!(env.EMAIL_USER && env.EMAIL_PASSWORD),
    cloudStorage: !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.S3_BUCKET_NAME),
  },
});

module.exports = config;