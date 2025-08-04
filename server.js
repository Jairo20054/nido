const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const database = require('./config/database');
const requestLogger = require('./middleware/loggingMiddleware');

const app = express();
const port = config.server.port;

// Conectar a la base de datos
database.connect();

// Middleware de logging detallado
app.use(requestLogger);

// Configuración de CORS
app.use(cors(config.cors));

// Middleware para parsear JSON en el body
app.use(express.json({ limit: '10mb' }));

// Middleware para parsear URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Ruta de inicio
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a la API de Nido',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Usar las rutas de la API
app.use('/api', routes);

// Middleware para manejar errores
app.use(errorHandler);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`=== SERVIDOR BACKEND NIDO ===`);
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Base de datos: ${config.database.type}`);
  console.log(`CORS origin: ${config.cors.origin}`);
  console.log(`============================`);
});
