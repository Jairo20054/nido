const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/auth');

// Rutas para reservas
router.get('/', verifyToken, bookingController.getAllBookings);
router.get('/:id', verifyToken, bookingController.getBookingById);
router.get('/user/:userId', verifyToken, bookingController.getBookingsByUserId);
router.post('/', verifyToken, bookingController.createBooking);
router.put('/:id', verifyToken, bookingController.updateBooking);
router.delete('/:id', verifyToken, bookingController.deleteBooking);

module.exports = router;
