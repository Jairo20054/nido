// config/db.js
const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

const connect = async () => {
  const uri = config.database.uri;
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10
  };

  try {
    await mongoose.connect(uri, options);
    logger.info('Connected to MongoDB', { uri: uri.split('@').pop ? uri.split('@').pop() : uri });
    // Optional: enable mongoose debug in non-prod
    if (process.env.NODE_ENV !== 'production') {
      mongoose.set('debug', true);
    }
  } catch (err) {
    logger.error('MongoDB connection error', { message: err.message });
    throw err;
  }

  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error', { message: err.message }));
};

const disconnect = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected (manual)');
  } catch (err) {
    logger.error('Error disconnecting MongoDB', { message: err.message });
  }
};

module.exports = { connect, disconnect };
