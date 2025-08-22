// server.js
'use strict';

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const validateEnv = require('./config/validateEnv');
const config = require('./config');
const db = require('./config/db');
const routes = require('./routes'); // asumes que existe index.js que exporta routers
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const logger = require('./utils/logger');

(async () => {
  // Validate environment and normalize config
  const env = validateEnv();

  const app = express();

  // Connect to DB (await to fail fast if cannot connect)
  try {
    await db.connect();
  } catch (err) {
    logger.error('Database connection failed, exiting.', { message: err.message });
    process.exit(1);
  }

  // Security middlewares
  app.use(helmet());
  app.use(compression());

  // Logging
  app.use(requestLogger);

  // CORS
  app.use(cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }));

  // Rate limiter - apply globally (tweak if needed)
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use(limiter);

  // Body parsers with limits
  app.use(express.json({ limit: `${env.MAX_FILE_SIZE}b` }));
  app.use(express.urlencoded({ extended: true, limit: `${env.MAX_FILE_SIZE}b` }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // Health & metadata
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Bienvenido a la API de Nido',
      version: env.APP_VERSION || '1.0.0',
      env: env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });

  app.get('/health', (req, res) => {
    res.json({
      success: true,
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API routes under /api
  app.use('/api', routes);

  // Error handler (last middleware)
  app.use(errorHandler);

  // Graceful shutdown
  const server = app.listen(env.PORT, env.HOST, () => {
    logger.info('=== SERVIDOR BACKEND NIDO ===', {
      host: env.HOST,
      port: env.PORT,
      env: env.NODE_ENV,
      db: env.MONGODB_URI ? 'configured' : 'not-configured',
      cors: env.CORS_ORIGINS
    });
    console.log(`Servidor backend escuchando en http://${env.HOST}:${env.PORT}`);
  });

  const shutdown = async (signal) => {
    try {
      logger.info(`Received ${signal}. Graceful shutdown start`);
      server.close(() => logger.info('HTTP server closed'));
      await db.disconnect();
      logger.info('Database disconnected');
      // close other connections (redis, queues...) here
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', { message: err.message });
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('uncaughtException', (err) => {
    logger.error('uncaughtException', { message: err.message, stack: err.stack });
    shutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason) => {
    logger.error('unhandledRejection', { reason });
    shutdown('unhandledRejection');
  });
})();
