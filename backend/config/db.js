// config/db.js
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger'); // Asumiendo que tienes un logger

// 🛡️ FUNCIÓN PARA OFUSCAR CREDENCIALES EN EL URI
// Oculta información sensible en los logs
const obfuscateUri = (uri) => {
  try {
    const url = new URL(uri);
    if (url.password) {
      url.password = '***';
    }
    if (url.username) {
      url.username = url.username.substring(0, 3) + '***';
    }
    return url.toString();
  } catch {
    return uri; // Fallback si el parsing falla
  }
};

// ⚙️ OPCIONES MEJORADAS DE CONEXIÓN
const getConnectionOptions = () => ({
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: config.database.options.serverSelectionTimeoutMS,
  socketTimeoutMS: config.database.options.socketTimeoutMS,
  maxPoolSize: config.database.options.maxPoolSize,
  minPoolSize: config.database.options.minPoolSize,
  retryWrites: true,
  retryReads: true,
});

// 📊 ESTADÍSTICAS DE CONEXIÓN
const connectionStats = {
  attempts: 0,
  connected: false,
  lastConnection: null,
  lastDisconnection: null,
};

// 🔌 CONEXIÓN A MONGODB
const connect = async () => {
  const uri = config.database.uri;
  const options = getConnectionOptions();
  const obfuscatedUri = obfuscateUri(uri);

  // 📝 REGISTRO DE MANEJADORES DE EVENTOS
  mongoose.connection.on('connecting', () => {
    connectionStats.attempts++;
    logger.info(`Conectando a MongoDB... [Intento ${connectionStats.attempts}]`, {
      uri: obfuscatedUri
    });
  });

  mongoose.connection.on('connected', () => {
    connectionStats.connected = true;
    connectionStats.lastConnection = new Date();
    connectionStats.attempts = 0;
    
    logger.info('Conexión a MongoDB establecida correctamente', {
      uri: obfuscatedUri,
      poolSize: mongoose.connection.base.connections.length
    });
  });

  mongoose.connection.on('disconnected', () => {
    connectionStats.connected = false;
    connectionStats.lastDisconnection = new Date();
    
    logger.warn('Conexión a MongoDB perdida', {
      uri: obfuscatedUri,
      lastActive: connectionStats.lastConnection.toISOString()
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
      message: error.message,
      stack: error.stack,
      uri: obfuscatedUri
    });
  });

  mongoose.connection.on('fullsetup', () => {
    logger.debug('Conjunto de réplicas de MongoDB conectado');
  });

  // 🐛 MODO DEBUG EN DESARROLLO
  if (config.isDev) {
    mongoose.set('debug', (coll, method, query, doc) => {
      logger.debug(`Consulta MongoDB: ${coll}.${method}`, {
        collection: coll,
        method: method,
        query: JSON.stringify(query),
        doc: JSON.stringify(doc)
      });
    });
  }

  try {
    // 🔗 INTENTAR CONEXIÓN
    await mongoose.connect(uri, options);
    
    // ❤️ HEARTBEAT PARA MONITOREAR LA CONEXIÓN
    setInterval(async () => {
      if (mongoose.connection.readyState === 1) {
        try {
          await mongoose.connection.db.admin().ping();
          logger.debug('Heartbeat MongoDB: Conexión activa');
        } catch (error) {
          logger.warn('Heartbeat MongoDB falló', {
            message: error.message
          });
        }
      }
    }, 30000);

  } catch (error) {
    logger.error('Error al conectar con MongoDB', {
      message: error.message,
      stack: error.stack,
      uri: obfuscatedUri,
      retryAttempts: connectionStats.attempts
    });

    // 🔄 REINTENTO CON BACKOFF EXPONENCIAL
    const retryDelay = Math.min(1000 * 2 ** connectionStats.attempts, 30000);
    logger.info(`Reintentando conexión en ${retryDelay}ms...`);
    
    setTimeout(connect, retryDelay);
  }
};

// 🔌 DESCONEXIÓN CONTROLADA
const disconnect = async () => {
  try {
    await mongoose.disconnect();
    logger.info('Desconexión manual de MongoDB realizada correctamente', {
      activeTime: Math.round(process.uptime()) + 's'
    });
  } catch (error) {
    logger.error('Error durante la desconexión manual', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// 🚪 MANEJO GRACEFUL DE SHUTDOWN
process.on('SIGINT', async () => {
  logger.info('Recibida señal SIGINT, cerrando conexión a MongoDB...');
  await disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Recibida señal SIGTERM, cerrando conexión a MongoDB...');
  await disconnect();
  process.exit(0);
});

// 📊 MÉTODOS DE UTILIDAD
const getConnectionStatus = () => ({
  connected: connectionStats.connected,
  attempts: connectionStats.attempts,
  lastConnection: connectionStats.lastConnection,
  lastDisconnection: connectionStats.lastDisconnection,
  readyState: mongoose.connection.readyState,
});

module.exports = { 
  connect, 
  disconnect,
  getConnectionStatus,
  connection: mongoose.connection
};