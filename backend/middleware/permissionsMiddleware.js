const Booking = require('../models/Booking');

const checkBookingOwnership = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // Verificar si el usuario es el propietario de la reserva
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a esta reserva'
      });
    }
    
    req.booking = booking;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar los permisos de la reserva'
    });
  }
};

const validateCancellationWindow = async (req, res, next) => {
  try {
    const booking = req.booking;
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    
    // Verificar que la cancelación sea al menos 24 horas antes del check-in
    const timeDifference = checkInDate - now;
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    
    if (hoursDifference < 24) {
      return res.status(400).json({
        success: false,
        message: 'Solo puedes cancelar reservas con al menos 24 horas de anticipación'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al validar la ventana de cancelación'
    });
  }
};

module.exports = {
  checkBookingOwnership,
  validateCancellationWindow
};