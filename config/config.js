// Configuración general de la aplicación
require('dotenv').config();

const config = {
  // Configuración del servidor
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
  },
  
  // Configuración de la base de datos
  database: {
    type: process.env.DB_TYPE || 'mongodb',
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nido'
    }
  },
  
  // Configuración de autenticación
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'nido_jwt_secret',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  },
  
  // Configuración de CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  
  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  // Configuración de APIs externas
  api: {
    // Ejemplo: API de geolocalización
    geolocation: {
      apiKey: process.env.GEOLOCATION_API_KEY || '',
    },
    
    // Ejemplo: API de pagos
    payment: {
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      },
    },
  },
};

module.exports = config;
