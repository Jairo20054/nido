// Configuración de la base de datos
const mongoose = require('mongoose');
const config = require('../backend/config/config');

// Configuración para MongoDB
const mongodbConfig = {
  uri: config.database.mongodb.uri,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
};

// Función para conectar a la base de datos
const connectDatabase = async () => {
  try {
    await mongoose.connect(mongodbConfig.uri, mongodbConfig.options);
    console.log('=== CONEXIÓN A BASE DE DATOS ===');
    console.log(`Conectado a MongoDB en: ${mongodbConfig.uri}`);
    console.log(`==============================`);
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
    process.exit(1);
  }
};

// Función para desconectar de la base de datos
const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('Desconectado de la base de datos');
  } catch (error) {
    console.error('Error al desconectar de la base de datos:', error.message);
  }
};

module.exports = {
  connect: connectDatabase,
  disconnect: disconnectDatabase
};
