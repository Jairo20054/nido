// backend/config/db.js
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

// Oculta información sensible en los logs
const obfuscateUri = (uri) => {
  try {
    if (!uri) return 'unknown';
    const url = new URL(uri);
    if (url.password) url.password = '***';
    if (url.username) url.username = url.username ? url.username.substring(0, 3) + '***' : undefined;
    return url.toString();
  } catch {
    return uri || 'unknown';
  }
};

// Opciones de conexión con valores por defecto
const getConnectionOptions = () => {
  const opts = (config && config.database && config.database.options) || {};
  return {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: opts.serverSelectionTimeoutMS ?? 5000,
    socketTimeoutMS: opts.socketTimeoutMS ?? 45000,
    maxPoolSize: opts.maxPoolSize ?? 10,
    minPoolSize: opts.minPoolSize ?? 0,
    retryWrites: true,
    retryReads: true,
  };
};

// Estadísticas simples para observabilidad
const connectionStats = {
  attempts: 0,
  connected: false,
  lastConnection: null,
  lastDisconnection: null,
};

// URI: preferir config, sino env, sino fallback local
const getUri = () => {
  return (config && config.database && config.database.uri) ||
         process.env.MONGODB_URI ||
         process.env.MONGO_URI ||
         'mongodb://localhost:27017/nido';
};

const connect = async () => {
  const uri = getUri();
  const options = getConnectionOptions();
  const obfuscatedUri = obfuscateUri(uri);

  // Eventos de conexión
  mongoose.connection.on('connecting', () => {
    connectionStats.attempts++;
    logger.info(`Conectando a MongoDB... [Intento ${connectionStats.attempts}]`, { uri: obfuscatedUri });
  });

  mongoose.connection.on('connected', () => {
    connectionStats.connected = true;
    connectionStats.lastConnection = new Date();
    connectionStats.attempts = 0;

    const poolSize = options.maxPoolSize ?? 'unknown';

    logger.info('Conexión a base de datos establecida', {
      uri: obfuscatedUri,
      poolSize
    });
  });

  mongoose.connection.on('disconnected', () => {
    connectionStats.connected = false;
    connectionStats.lastDisconnection = new Date();

    // 🔧 CORRECCIÓN: Verificación segura para toISOString()
    const lastActive = connectionStats.lastConnection && 
                      typeof connectionStats.lastConnection.toISOString === 'function' 
                      ? connectionStats.lastConnection.toISOString() 
                      : null;

    logger.warn('Conexión a MongoDB perdida', {
      uri: obfuscatedUri,
      lastActive
    });
  });

  mongoose.connection.on('reconnected', () => {
    connectionStats.connected = true;
    connectionStats.lastConnection = new Date();
    logger.info('Conexión a MongoDB reestablecida', {
      uri: obfuscatedUri,
      retryAttempts: connectionStats.attempts
    });
  });

  mongoose.connection.on('error', (error) => {
    logger.error('Error de conexión a MongoDB', {
      message: error && error.message ? error.message : String(error),
      stack: error && error.stack ? error.stack : undefined,
      uri: obfuscatedUri
    });
  });

  mongoose.connection.on('fullsetup', () => {
    logger.debug('Conjunto de réplicas de MongoDB conectado');
  });

  // Debug queries solo en desarrollo
  if (config && config.isDev) {
    mongoose.set('debug', (coll, method, query, doc) => {
      logger.debug(`Consulta MongoDB: ${coll}.${method}`, {
        collection: coll,
        method,
        query: (() => {
          try { return JSON.stringify(query); } catch { return String(query); }
        })(),
        doc: (() => {
          try { return JSON.stringify(doc); } catch { return String(doc); }
        })()
      });
    });
  }

  try {
    // Intento de conexión
    await mongoose.connect(uri, options);

    // Heartbeat (solo si la conexión está activa)
    const heartbeatInterval = 30 * 1000;
    setInterval(async () => {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        try {
          await mongoose.connection.db.admin().ping();
          logger.debug('Heartbeat MongoDB: Conexión activa');
        } catch (error) {
          logger.warn('Heartbeat MongoDB falló', { message: error && error.message ? error.message : String(error) });
        }
      }
    }, heartbeatInterval);

  } catch (error) {
    logger.error('Error al conectar con MongoDB', {
      message: error && error.message ? error.message : String(error),
      stack: error && error.stack ? error.stack : undefined,
      uri: obfuscatedUri,
      retryAttempts: connectionStats.attempts
    });

    // Reintento con backoff exponencial (limitar máximo)
    const retryDelay = Math.min(1000 * 2 ** Math.max(connectionStats.attempts, 0), 30000);
    logger.info(`Reintentando conexión en ${retryDelay}ms...`);
    setTimeout(connect, retryDelay);
  }
};

const disconnect = async () => {
  try {
    await mongoose.disconnect();
    logger.info('Desconexión manual de MongoDB realizada correctamente', {
      activeTime: Math.round(process.uptime()) + 's'
    });
  } catch (error) {
    logger.error('Error durante la desconexión manual', {
      message: error && error.message ? error.message : String(error),
      stack: error && error.stack ? error.stack : undefined
    });
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Recibida señal SIGINT, cerrando conexión a MongoDB...');
  try { await disconnect(); } catch(e) { /* ignore */ }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Recibida señal SIGTERM, cerrando conexión a MongoDB...');
  try { await disconnect(); } catch(e) { /* ignore */ }
  process.exit(0);
});

const getConnectionStatus = () => ({
  connected: connectionStats.connected,
  attempts: connectionStats.attempts,
  lastConnection: connectionStats.lastConnection,
  lastDisconnection: connectionStats.lastDisconnection,
  readyState: mongoose.connection ? mongoose.connection.readyState : 0,
});

module.exports = {
  connect,
  disconnect,
  getConnectionStatus,
  connection: mongoose.connection
};