const express = require('express');
const router = express.Router();
const dbHealthCheck = require('../config/db-health');
const auth = require('../middleware/auth');

// Ruta protegida para verificar el estado de la base de datos
router.get('/health', auth.requireAdmin, async (req, res) => {
  try {
    const status = dbHealthCheck.getStatus();
    res.json({
      database: status,
      uptime: process.uptime(),
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener estado de la base de datos',
      details: error.message
    });
  }
});

module.exports = router;
