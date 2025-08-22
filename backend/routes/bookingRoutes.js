const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const validationMiddleware = require('../middleware/validationMiddleware');
const permissionsMiddleware = require('../middleware/permissionsMiddleware');

// Rate limiting para prevenir abuso de la API
const createBookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 reservas por ventana de tiempo
  message: {
    success: false,
    message: 'Demasiadas reservas creadas. Por favor espere antes de intentar nuevamente.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const cancelBookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 cancelaciones por hora
  message: {
    success: false,
    message: 'Límite de cancelaciones excedido. Por favor espere antes de intentar nuevamente.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validaciones mejoradas
const bookingValidation = [
  body('propertyId')
    .isMongoId()
    .withMessage('ID de propiedad inválido'),
  
  body('checkIn')
    .isISO8601()
    .withMessage('Fecha de check-in inválida')
    .custom((value, { req }) => {
      const checkInDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkInDate < today) {
        throw new Error('La fecha de check-in no puede ser anterior a hoy');
      }
      
      return true;
    }),
  
  body('checkOut')
    .isISO8601()
    .withMessage('Fecha de check-out inválida')
    .custom((value, { req }) => {
      if (req.body.checkIn) {
        const checkInDate = new Date(req.body.checkIn);
        const checkOutDate = new Date(value);
        
        if (checkOutDate <= checkInDate) {
          throw new Error('La fecha de check-out debe ser posterior a la fecha de check-in');
        }
        
        // Validar que la estadía no exceda un límite razonable (ej. 30 días)
        const diffTime = Math.abs(checkOutDate - checkInDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 30) {
          throw new Error('La estadía no puede exceder los 30 días');
        }
      }
      
      return true;
    }),
  
  body('guests')
    .isInt({ min: 1, max: 10 })
    .withMessage('El número de huéspedes debe ser entre 1 y 10'),
  
  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las solicitudes especiales no pueden exceder los 500 caracteres'),
  
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'stripe'])
    .withMessage('Método de pago inválido')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El número de página debe ser un entero positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe ser entre 1 y 50'),
  
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Estado de reserva inválido')
];

const paramsValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de reserva inválido')
];

// Rutas protegidas
router.post(
  '/',
  auth.required,
  createBookingLimiter,
  bookingValidation,
  validationMiddleware.handleValidationErrors,
  bookingController.createBooking
);

router.get(
  '/',
  auth.required,
  queryValidation,
  validationMiddleware.handleValidationErrors,
  bookingController.getUserBookings
);

router.get(
  '/:id',
  auth.required,
  paramsValidation,
  validationMiddleware.handleValidationErrors,
  permissionsMiddleware.checkBookingOwnership,
  bookingController.getBookingDetail
);

router.put(
  '/:id/cancel',
  auth.required,
  cancelBookingLimiter,
  paramsValidation,
  validationMiddleware.handleValidationErrors,
  permissionsMiddleware.checkBookingOwnership,
  permissionsMiddleware.validateCancellationWindow,
  bookingController.cancelBooking
);

router.put(
  '/:id',
  auth.required,
  paramsValidation,
  validationMiddleware.handleValidationErrors,
  permissionsMiddleware.checkBookingOwnership,
  bookingController.updateBooking
);

// Ruta para anfitriones (ver reservas de sus propiedades)
router.get(
  '/host/listings',
  auth.required,
  auth.hostOnly,
  queryValidation,
  validationMiddleware.handleValidationErrors,
  bookingController.getHostBookings
);

module.exports = router;