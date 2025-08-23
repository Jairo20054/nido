// config/validateEnv.js
const Joi = require('joi');

/**
 * Esquema de validación para variables de entorno utilizando Joi
 * Define todas las variables necesarias para el correcto funcionamiento de la aplicación
 * con sus respectivas validaciones y valores por defecto.
 */
const schema = Joi.object({
  // Entorno de ejecución de la aplicación
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('Entorno de ejecución de la aplicación'),

  // Configuración del servidor
  PORT: Joi.number()
    .default(5000)
    .description('Puerto en el que escuchará el servidor'),
  HOST: Joi.string()
    .default('0.0.0.0')
    .description('Host del servidor'),
  BASE_URL: Joi.string()
    .uri()
    .default('http://localhost:5000')
    .description('URL base de la API'),
  FRONTEND_URL: Joi.string()
    .uri()
    .default('http://localhost:3000')
    .description('URL del frontend para configuración de CORS'),
  TIMEZONE: Joi.string()
    .default('UTC')
    .description('Zona horaria para fechas y horas'),

  // Configuración de base de datos
  MONGODB_URI: Joi.string()
    .required()
    .description('URI de conexión a MongoDB (requerido)'),
  DB_NAME: Joi.string()
    .default('nido')
    .description('Nombre de la base de datos'),

  // Configuración de autenticación JWT
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secreto para firmar tokens JWT (mínimo 32 caracteres)'),
  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secreto para firmar tokens de refresco JWT'),
  JWT_EXPIRE: Joi.string()
    .default('7d')
    .description('Tiempo de expiración de tokens JWT'),
  JWT_REFRESH_EXPIRE: Joi.string()
    .default('30d')
    .description('Tiempo de expiración de tokens de refresco'),
  BCRYPT_SALT_ROUNDS: Joi.number()
    .default(12)
    .description('Número de rondas de sal para bcrypt'),

  // Configuración de cookies
  COOKIE_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secreto para firmar cookies (mínimo 32 caracteres)'),
  COOKIE_SECURE: Joi.boolean()
    .default(false)
    .description('Cookies solo se envían sobre HTTPS'),
  COOKIE_HTTP_ONLY: Joi.boolean()
    .default(true)
    .description('Cookies accesibles solo por HTTP (no JavaScript)'),
  COOKIE_SAME_SITE: Joi.string()
    .valid('lax', 'strict', 'none')
    .default('lax')
    .description('Política SameSite para cookies'),

  // Configuración de email
  EMAIL_SERVICE: Joi.string()
    .allow('', null)
    .description('Servicio de email (ej: Gmail, SendGrid)'),
  EMAIL_USER: Joi.string()
    .allow('', null)
    .description('Usuario para el servicio de email'),
  EMAIL_PASS: Joi.string()
    .allow('', null)
    .description('Contraseña para el servicio de email'),

  // Configuración de Stripe (pasarela de pagos)
  STRIPE_SECRET_KEY: Joi.string()
    .allow('', null)
    .description('Clave secreta de Stripe para procesamiento de pagos'),
  STRIPE_PUBLISHABLE_KEY: Joi.string()
    .allow('', null)
    .description('Clave pública de Stripe para el frontend'),
  STRIPE_WEBHOOK_SECRET: Joi.string()
    .allow('', null)
    .description('Secreto para verificar webhooks de Stripe'),

  // Configuración de Mercado Pago
  MERCADO_PAGO_ACCESS_TOKEN: Joi.string()
    .allow('', null)
    .description('Token de acceso para Mercado Pago'),

  // Configuración de Redis (cache y sesiones)
  REDIS_URL: Joi.string()
    .allow('', null)
    .description('URL de conexión a Redis'),
  REDIS_PASSWORD: Joi.string()
    .allow('', null)
    .description('Contraseña para Redis'),
  REDIS_DB: Joi.number()
    .default(0)
    .description('Número de base de datos Redis a utilizar'),

  // Configuración de uploads de archivos
  MAX_FILE_SIZE: Joi.number()
    .default(5242880) // 5MB
    .description('Tamaño máximo de archivo en bytes (por defecto 5MB)'),
  ALLOWED_FILE_TYPES: Joi.string()
    .default('jpg,jpeg,png,gif,webp')
    .description('Tipos de archivo permitidos separados por coma'),

  // Configuración de CORS (Cross-Origin Resource Sharing)
  CORS_ORIGINS: Joi.string()
    .default('http://localhost:3000')
    .description('Orígenes permitidos para CORS separados por coma'),

  // Configuración de rate limiting
  RATE_LIMIT_WINDOW_MS: Joi.number()
    .default(900000) // 15 minutos
    .description('Ventana de tiempo para límite de peticiones en milisegundos'),
  RATE_LIMIT_MAX_REQUESTS: Joi.number()
    .default(100)
    .description('Máximo número de peticiones por ventana de tiempo'),

  // Configuración general de la aplicación
  LOG_LEVEL: Joi.string()
    .default('info')
    .description('Nivel de logging (error, warn, info, debug)'),
  ENABLE_SWAGGER: Joi.boolean()
    .default(true)
    .description('Habilitar documentación de API con Swagger'),
  ENABLE_EMAIL_VERIFICATION: Joi.boolean()
    .default(true)
    .description('Habilitar verificación de email para nuevos usuarios'),
  ENABLE_PAYMENT_PROCESSING: Joi.boolean()
    .default(true)
    .description('Habilitar procesamiento de pagos'),
  ENABLE_GOOGLE_AUTH: Joi.boolean()
    .default(true)
    .description('Habilitar autenticación con Google'),

}).unknown(true); // Permite variables de entorno adicionales no definidas en el esquema

/**
 * Valida las variables de entorno contra el esquema definido
 * @returns {Object} Variables de entorno validadas y normalizadas
 * @throws {Error} Si la validación falla, detalla los errores encontrados
 */
function validateEnv() {
  const { error, value } = schema.validate(process.env, {
    abortEarly: false, // Mostrar todos los errores, no solo el primero
    allowUnknown: true // Permitir variables no definidas en el esquema
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message).join(', ');
    console.error('❌ Error de validación de variables de entorno:', errorMessages);
    throw new Error(`Configuración de entorno inválida. Verifique su archivo .env: ${errorMessages}`);
  }

  // Normalizar CORS_ORIGINS de string a array
  value.CORS_ORIGINS = value.CORS_ORIGINS
    ? value.CORS_ORIGINS.split(',').map(s => s.trim())
    : [];

  console.log('✅ Variables de entorno validadas correctamente');
  return value;
}

module.exports = validateEnv;