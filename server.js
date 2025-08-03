const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = config.server.port;

app.use(cors(config.cors));
app.use(express.json());

// Ruta de inicio
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a la API de Nido',
    version: '1.0.0'
  });
});

// Usar las rutas de la API
app.use('/api', routes);

// Middleware para manejar errores
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
