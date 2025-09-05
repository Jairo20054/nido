const { validationResult, body, param, query } = require('express-validator');

/**
 * Middleware para manejar errores de validación de express-validator
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return res.status(422).json({
      success: false,
      message: 'Errores de validación en los datos proporcionados',
      error: 'VALIDATION_ERROR',
      errors: formattedErrors,
      totalErrors: formattedErrors.length
    });
  }

  next();
};

/**
 * Validaciones comunes reutilizables
 */

// Validaciones para usuarios
const userValidations = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .withMessage('El nombre solo puede contener letras y espacios'),

    body('email')
      .isEmail()
      .withMessage('Debe proporcionar un email válido')
      .normalizeEmail(),

    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),

    body('role')
      .optional()
      .isIn(['user', 'host', 'admin'])
      .withMessage('El rol debe ser user, host o admin')
  ],

  login: [
    body('email')
      .isEmail()
      .withMessage('Debe proporcionar un email válido')
      .normalizeEmail(),

    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
  ],

  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),

    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('La biografía no puede exceder 500 caracteres'),

    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Número de teléfono inválido')
  ]
};

// Validaciones para propiedades
const propertyValidations = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 10, max: 100 })
      .withMessage('El título debe tener entre 10 y 100 caracteres'),

    body('description')
      .trim()
      .isLength({ min: 50, max: 1000 })
      .withMessage('La descripción debe tener entre 50 y 1000 caracteres'),

    body('location')
      .trim()
      .notEmpty()
      .withMessage('La ubicación es requerida'),

    body('address.street')
      .trim()
      .notEmpty()
      .withMessage('La calle es requerida'),

    body('address.city')
      .trim()
      .notEmpty()
      .withMessage('La ciudad es requerida'),

    body('address.state')
      .trim()
      .notEmpty()
      .withMessage('El estado es requerido'),

    body('address.country')
      .trim()
      .notEmpty()
      .withMessage('El país es requerido'),

    body('address.zipCode')
      .matches(/^\d{5}(-\d{4})?$/)
      .withMessage('El código postal debe tener formato válido'),

    body('coordinates')
      .isArray({ min: 2, max: 2 })
      .withMessage('Las coordenadas deben ser un array de 2 elementos'),

    body('price')
      .isFloat({ min: 1, max: 1000000 })
      .withMessage('El precio debe estar entre 1 y 1,000,000'),

    body('pricePerNight')
      .isFloat({ min: 1 })
      .withMessage('El precio por noche debe ser mayor a 0')
      .custom((value, { req }) => {
        if (value > req.body.price) {
          throw new Error('El precio por noche no puede ser mayor al precio total');
        }
        return true;
      }),

    body('propertyType')
      .isIn(['apartment', 'house', 'condo', 'villa', 'cabin', 'loft', 'townhouse'])
      .withMessage('Tipo de propiedad inválido'),

    body('bedrooms')
      .isInt({ min: 0 })
      .withMessage('El número de habitaciones debe ser un entero no negativo'),

    body('bathrooms')
      .isFloat({ min: 0 })
      .withMessage('El número de baños debe ser un número no negativo'),

    body('maxGuests')
      .isInt({ min: 1, max: 20 })
      .withMessage('El número máximo de huéspedes debe estar entre 1 y 20')
  ],

  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 10, max: 100 })
      .withMessage('El título debe tener entre 10 y 100 caracteres'),

    body('description')
      .optional()
      .trim()
      .isLength({ min: 50, max: 1000 })
      .withMessage('La descripción debe tener entre 50 y 1000 caracteres'),

    body('price')
      .optional()
      .isFloat({ min: 1, max: 1000000 })
      .withMessage('El precio debe estar entre 1 y 1,000,000')
  ]
};

// Validaciones para reservas
const bookingValidations = {
  create: [
    body('property')
      .isMongoId()
      .withMessage('ID de propiedad inválido'),

    body('checkIn')
      .isISO8601()
      .withMessage('Fecha de check-in inválida')
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('La fecha de check-in debe ser futura');
        }
        return true;
      }),

    body('checkOut')
      .isISO8601()
      .withMessage('Fecha de check-out inválida')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.checkIn)) {
          throw new Error('La fecha de check-out debe ser posterior a la de check-in');
        }
        return true;
      }),

    body('guests.adults')
      .isInt({ min: 1 })
      .withMessage('Debe haber al menos 1 adulto'),

    body('guests.children')
      .optional()
      .isInt({ min: 0 })
      .withMessage('El número de niños debe ser un entero no negativo'),

    body('guests.infants')
      .optional()
      .isInt({ min: 0 })
      .withMessage('El número de infantes debe ser un entero no negativo'),

    body('specialRequests')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Las solicitudes especiales no pueden exceder 500 caracteres')
  ]
};

// Validaciones para mensajes
const messageValidations = {
  create: [
    body('recipient')
      .isMongoId()
      .withMessage('ID de destinatario inválido'),

    body('property')
      .isMongoId()
      .withMessage('ID de propiedad inválido'),

    body('content')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('El mensaje debe tener entre 1 y 1000 caracteres')
  ]
};

// Validaciones para pagos
const paymentValidations = {
  create: [
    body('booking')
      .isMongoId()
      .withMessage('ID de reserva inválido'),

    body('amount')
      .isFloat({ min: 0 })
      .withMessage('El monto debe ser un número positivo'),

    body('paymentMethod')
      .isIn(['credit_card', 'debit_card', 'paypal', 'stripe'])
      .withMessage('Método de pago inválido')
  ]
};

// Validaciones de parámetros de ruta
const paramValidations = {
  id: [
    param('id')
      .isMongoId()
      .withMessage('ID inválido')
  ]
};

// Validaciones de query parameters
const queryValidations = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La página debe ser un número entero positivo'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe estar entre 1 y 100')
  ],

  dateRange: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio inválida'),

    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de fin inválida')
      .custom((value, { req }) => {
        if (req.query.startDate && value <= req.query.startDate) {
          throw new Error('La fecha de fin debe ser posterior a la de inicio');
        }
        return true;
      })
  ]
};

module.exports = {
  handleValidationErrors,
  userValidations,
  propertyValidations,
  bookingValidations,
  messageValidations,
  paymentValidations,
  paramValidations,
  queryValidations
};
