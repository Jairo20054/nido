'use strict';

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
const fs = require('fs');

// Configuraciones y utilidades
const config = require('./config/config');
const { connect: connectDB } = require('./config/db');
const routes = require('./routes');
const requestLogger = require('./middleware/loggingMiddleware');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// ✅ CORRECCIÓN: Manejo mejorado de Swagger
let swaggerSetup = null;
try {
  const swaggerUi = require('swagger-ui-express');
  const YAML = require('yamljs');
  const swaggerPath = path.join(__dirname, './swagger.yaml');
  
  if (fs.existsSync(swaggerPath)) {
    const swaggerDocument = YAML.load(swaggerPath);
    swaggerSetup = { swaggerUi, swaggerDocument };
    logger.info('Documentación Swagger cargada correctamente');
  } else {
    logger.warn('Archivo Swagger no encontrado, omitiendo carga');
  }
} catch (error) {
  logger.warn('Error al cargar Swagger', { error: error.message });
}

// Inicializar aplicación Express
const app = express();
const port = process.env.PORT || config.server.port || 5001; // 🔧 Cambiado a 5001

// 🔐 Configuración de seguridad avanzada
app.set('trust proxy', 1);

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

// 🌐 Configuración CORS
const corsOptions = {
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ⚡ Rate limiting estratificado
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
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
  limit: config.server.uploadLimit,
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({
  extended: true,
  limit: config.server.uploadLimit,
  parameterLimit: 1000
}));

// 🍪 Parser de cookies seguro
app.use(cookieParser(process.env.COOKIE_SECRET || 'nido-cookie-secret', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
}));

// 📁 Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : '0'
}));

// 📚 Documentación API con Swagger (si está disponible)
if (swaggerSetup && process.env.NODE_ENV !== 'production') {
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
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    documentation: process.env.NODE_ENV !== 'production' ? '/api-docs' : null
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
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        connection: mongoose.connection.host || 'unknown',
        name: mongoose.connection.name || 'unknown'
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

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    logger.info('Conexión a base de datos establecida', {
      host: mongoose.connection.host,
      name: mongoose.connection.name
    });

    // Iniciar servidor
    const server = app.listen(port, config.server.host || 'localhost', () => {
      logger.info('Servidor backend iniciado', {
        host: config.server.host || 'localhost',
        port: port,
        environment: process.env.NODE_ENV || 'development'
      });
      
      console.log(`\n=== SERVIDOR BACKEND NIDO ===`);
      console.log(`🚀 Servidor ejecutándose en http://${config.server.host || 'localhost'}:${port}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Base de datos: ${mongoose.connection.name}`);
      console.log(`📍 Host BD: ${mongoose.connection.host}`);
      console.log(`🔗 CORS origin: ${config.cors.origin}`);
      if (process.env.NODE_ENV !== 'production' && swaggerSetup) {
        console.log(`📚 Documentación disponible en http://${config.server.host || 'localhost'}:${port}/api-docs`);
      }
      console.log(`============================`);
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
        await mongoose.connection.close();
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
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

// Iniciar la aplicación
startServer();

module.exports = app;