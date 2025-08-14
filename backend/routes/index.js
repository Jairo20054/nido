const express = require('express');
const router = express.Router();

// Importar las rutas individuales
const propertyRoutes = require('./propertyRoutes');
const userRoutes = require('./userRoutes');
const bookingRoutes = require('./bookingRoutes');

// Usar las rutas individuales
router.use('/properties', propertyRoutes);
router.use('/users', userRoutes);
router.use('/bookings', bookingRoutes);

module.exports = router;
