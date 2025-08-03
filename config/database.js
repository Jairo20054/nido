// Configuración de la base de datos
// En una implementación real, aquí se configuraría la conexión a una base de datos como MongoDB, PostgreSQL, etc.

const config = {
  // Configuración para MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nido',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // Configuración para PostgreSQL
  postgresql: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'nido',
    username: process.env.POSTGRES_USER || 'nido_user',
    password: process.env.POSTGRES_PASSWORD || 'nido_password',
  },
  
  // Configuración para MySQL
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    database: process.env.MYSQL_DB || 'nido',
    username: process.env.MYSQL_USER || 'nido_user',
    password: process.env.MYSQL_PASSWORD || 'nido_password',
  }
};

// Función para obtener la configuración de la base de datos según el tipo
const getDatabaseConfig = (type) => {
  switch (type) {
    case 'mongodb':
      return config.mongodb;
    case 'postgresql':
      return config.postgresql;
    case 'mysql':
      return config.mysql;
    default:
      // Por defecto, usamos MongoDB
      return config.mongodb;
  }
};

module.exports = {
  config,
  getDatabaseConfig
};
