// Módulo de control de estado de la base de datos
const dbHealthCheck = {
  isHealthy: false,
  lastCheck: null,
  errors: [],
  
  // Verificar el estado de la conexión
  check: async (mongoose) => {
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().ping();
        dbHealthCheck.isHealthy = true;
        dbHealthCheck.lastCheck = new Date();
        dbHealthCheck.errors = [];
      } else {
        throw new Error('Base de datos no conectada');
      }
    } catch (error) {
      dbHealthCheck.isHealthy = false;
      dbHealthCheck.lastCheck = new Date();
      dbHealthCheck.errors.push({
        timestamp: new Date(),
        message: error.message
      });
    }
    return dbHealthCheck.isHealthy;
  },

  // Obtener el estado actual
  getStatus: () => ({
    isHealthy: dbHealthCheck.isHealthy,
    lastCheck: dbHealthCheck.lastCheck,
    errors: dbHealthCheck.errors.slice(-5) // Últimos 5 errores
  })
};

module.exports = dbHealthCheck;
