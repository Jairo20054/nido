'use strict';

// ███╗   ██╗██╗██████╗ ██████╗  ██████╗ 
// ████╗  ██║██║██╔══██╗██╔══██╗██╔═══██╗
// ██╔██╗ ██║██║██║  ██║██║  ██║██║   ██║
// ██║╚██╗██║██║██║  ██║██║  ██║██║   ██║
// ██║ ╚████║██║██████╔╝██████╔╝╚██████╔╝
// ╚═╝  ╚═══╝╚═╝╚═════╝ ╚═════╝  ╚═════╝ 
//                                        
// Backend Airbnb - Versión Híbrida Optimizada

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const hpp = require('hpp');
const path = require('path');

// Configuraciones y utilidades
const validateEnv = require('./config/validateEnv');
const db = require('./config/db');
const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Intento de carga de Swagger (opcional)
let swaggerSetup = null;
try {
  const swaggerUi = require('swagger-ui-express');
  const YAML = require('yamljs');
  const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));
  swaggerSetup = { swaggerUi, swaggerDocument };
  logger.info('Documentación Swagger cargada correctamente');
} catch (error) {
  logger.warn('Swagger no disponible', { error: error.message });
}

(async () => {
  try {
    // Validar variables de entorno
    const env = validateEnv();

    // Inicializar aplicación Express
    const app = express();

    // 🔐 Configuración de seguridad avanzada
    app.set('trust proxy', 1); // Para detrás de balanceador de carga
    
    // Helmet con configuración específica
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
          scriptSrc: ["'self'", "https://maps.googleapis.com", "https://js.stripe.com"],
          imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
          connectSrc: ["'self'", "https://maps.googleapis.com", "https://api.stripe.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"]
        }
      },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    }));

    // Prevenir contaminación de parámetros HTTP
    app.use(hpp());

    // 🗜️ Compresión optimizada
    app.use(compression({
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
      }
    }));

    // 🌐 Configuración CORS robusta pero simplificada
    const corsOptions = {
      origin: env.CORS_ORIGINS.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining']
    };
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions)); // Pre-flight para todas las rutas

    // ⚡ Rate limiting estratificado
    const generalLimiter = rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
      message: {
        success: false,
        error: 'Límite de tasa excedido',
        message: 'Demasiadas solicitudes desde esta IP.'
      },
      standardHeaders: true,
      legacyHeaders: false
    });

    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: {
        success: false,
        error: 'Demasiados intentos de autenticación',
        message: 'Por favor espere 15 minutos antes de intentar nuevamente.'
      }
    });

    // Aplicar limitadores
    app.use('/api/auth/', authLimiter);
    app.use(generalLimiter);

    // 📊 Logging de requests
    app.use(requestLogger);

    // 📦 Body parsers con límites y verificación
    app.use(express.json({
      limit: `${env.MAX_FILE_SIZE}b`,
      verify: (req, res, buf) => {
        req.rawBody = buf; // Para verificación de webhooks
      }
    }));
    
    app.use(express.urlencoded({
      extended: true,
      limit: `${env.MAX_FILE_SIZE}b`,
      parameterLimit: 1000
    }));
    
    // 🍪 Parser de cookies seguro
    app.use(cookieParser(env.COOKIE_SECRET, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax'
    }));

    // 📁 Servir archivos estáticos
    app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
      maxAge: env.NODE_ENV === 'production' ? '7d' : '0'
    }));

    // 📚 Documentación API con Swagger (si está disponible)
    if (swaggerSetup && env.NODE_ENV !== 'production') {
      app.use('/api-docs', swaggerSetup.swaggerUi.serve, 
        swaggerSetup.swaggerUi.setup(swaggerSetup.swaggerDocument, {
          explorer: true,
          customCss: '.swagger-ui .topbar { display: none }'
        })
      );
    }

    // 🏠 Endpoints de información y salud
    app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Bienvenido a la API de Nido - Airbnb Clone',
        version: env.APP_VERSION || '1.0.0',
        env: env.NODE_ENV,
        timestamp: new Date().toISOString(),
        documentation: env.NODE_ENV !== 'production' ? '/api-docs' : null
      });
    });

    app.get('/health', async (req, res) => {
      try {
        const dbState = mongoose.connection.readyState;
        const dbStatus = {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting'
        }[dbState] || 'unknown';

        const healthInfo = {
          success: dbState === 1,
          status: dbState === 1 ? 'OK' : 'ERROR',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: env.NODE_ENV,
          database: {
            status: dbStatus,
            connection: mongoose.connection.host || 'unknown'
          }
        };

        res.status(dbState === 1 ? 200 : 503).json(healthInfo);
      } catch (error) {
        res.status(503).json({
          success: false,
          status: 'ERROR',
          message: 'Error en health check'
        });
      }
    });

    // 🚦 Montar rutas de la API
    app.use('/api', routes);

    // ❌ Manejo de rutas no encontradas
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe.`
      });
    });

    // 🚨 Manejo de errores (último middleware)
    app.use(errorHandler);

    // Conectar a la base de datos
    try {
      await db.connect();
      logger.info('Conexión a base de datos establecida', {
        host: mongoose.connection.host,
        name: mongoose.connection.name
      });
    } catch (err) {
      logger.error('Error de conexión a la base de datos', { 
        message: err.message,
        stack: err.stack 
      });
      process.exit(1);
    }

    // Iniciar servidor
    const server = app.listen(env.PORT, env.HOST, () => {
      logger.info('Servidor backend iniciado', {
        host: env.HOST,
        port: env.PORT,
        environment: env.NODE_ENV,
        version: env.APP_VERSION
      });
      
      console.log(`\n🚀 Servidor ejecutándose en http://${env.HOST}:${env.PORT}`);
      if (env.NODE_ENV !== 'production' && swaggerSetup) {
        console.log(`📚 Documentación disponible en http://${env.HOST}:${env.PORT}/api-docs`);
      }
    });

    // ⏰ Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`Iniciando apagado (${signal})...`);
      
      // Cerrar servidor HTTP
      server.close(() => {
        logger.info('Servidor HTTP cerrado');
      });
      
      // Cerrar conexiones de base de datos
      try {
        await db.disconnect();
        logger.info('Conexión a base de datos cerrada');
      } catch (err) {
        logger.error('Error al cerrar conexión de BD', { error: err.message });
      }
      
      // Salir después de un timeout
      setTimeout(() => {
        logger.info('Apagado completado');
        process.exit(0);
      }, 5000);
    };

    // Manejadores de señales
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('uncaughtException', (err) => {
      logger.error('Excepción no capturada', { 
        message: err.message, 
        stack: err.stack 
      });
      shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Promesa rechazada no manejada', { 
        reason: reason.message || reason
      });
      shutdown('unhandledRejection');
    });

  } catch (error) {
    logger.error('Error durante la inicialización', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
})();