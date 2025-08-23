// config/db.js
const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

// Función para ofuscar credenciales en el URI
const obfuscateUri = (uri) => {
  try {
    const url = new URL(uri);
    if (url.password) {
      url.password = '***';
    }
    return url.toString();
  } catch {
    return uri; // Fallback si el parsing falla
  }
};

// Opciones mejoradas de conexión
const getConnectionOptions = () => ({
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: config.database.serverSelectionTimeoutMS || 10000,
  socketTimeoutMS: config.database.socketTimeoutMS || 45000,
  maxPoolSize: config.database.maxPoolSize || 10,
  minPoolSize: config.database.minPoolSize || 2,
  maxIdleTimeMS: config.database.maxIdleTimeMS || 30000,
  retryWrites: true,
  retryReads: true,
  ...config.database.options // Opciones adicionales desde configuración
});

let isFirstConnection = true;
let retryAttempts = 0;

const connect = async () => {
  const uri = config.database.uri;
  const options = getConnectionOptions();
  const obfuscatedUri = obfuscateUri(uri);

  // Manejadores de eventos (deben registrarse antes de conectar)
  mongoose.connection.on('connecting', () => {
    logger.info('Connecting to MongoDB...', { 
      attempt: retryAttempts + 1,
      uri: obfuscatedUri 
    });
  });

  mongoose.connection.on('connected', () => {
    isFirstConnection = false;
    retryAttempts = 0;
    logger.info('MongoDB connected successfully', {
      uri: obfuscatedUri,
      poolSize: mongoose.connection.base.connections.length
    });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected', {
      uri: obfuscatedUri,
      lastActive: new Date().toISOString()
    });
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected', { 
      retryAttempts,
      uri: obfuscatedUri 
    });
  });

  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error', {
      message: error.message,
      stack: error.stack,
      uri: obfuscatedUri
    });
  });

  mongoose.connection.on('fullsetup', () => {
    logger.debug('MongoDB replica set connected');
  });

  // Configuración de debug en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    mongoose.set('debug', (coll, method, query, doc) => {
      logger.debug(`MongoDB Query: ${coll}.${method}`, {
        query: JSON.stringify(query),
        doc: JSON.stringify(doc)
      });
    });
  }

  try {
    await mongoose.connect(uri, options);
    
    // Heartbeat para monitorear la conexión
    setInterval(() => {
      if (mongoose.connection.readyState === 1) {
        mongoose.connection.db.admin().ping();
      }
    }, 30000);

  } catch (error) {
    logger.error('Failed to connect to MongoDB', {
      message: error.message,
      stack: error.stack,
      uri: obfuscatedUri,
      retryAttempts
    });

    // Reintento con backoff exponencial
    if (isFirstConnection) {
      const retryDelay = Math.min(1000 * 2 ** retryAttempts, 30000);
      retryAttempts++;
      logger.info(`Retrying connection in ${retryDelay}ms...`);
      setTimeout(connect, retryDelay);
    } else {
      throw new Error(`MongoDB connection failed after ${retryAttempts} attempts: ${error.message}`);
    }
  }
};

const disconnect = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB manually disconnected', {
      activeTime: Math.round(process.uptime()) + 's'
    });
  } catch (error) {
    logger.error('Error during manual disconnection', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Manejo graceful de shutdown
process.on('SIGINT', async () => {
  await disconnect();
  process.exit(0);
});

module.exports = { 
  connect, 
  disconnect,
  connection: mongoose.connection
};