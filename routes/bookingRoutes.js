const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Rutas para reservas
router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.get('/user/:userId', bookingController.getBookingsByUserId);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
