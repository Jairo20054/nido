const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const validationMiddleware = require('../middlewares/validationMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// Configuración de rate limiting para prevenir ataques de fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por ventana de tiempo
  message: {
    error: 'Demasiados intentos, por favor intente nuevamente en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // No contar intentos exitosos
});

// Validaciones mejoradas con mensajes personalizados
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Por favor proporcione un email válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El email no debe exceder los 255 caracteres'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),
  
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('El usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El usuario solo puede contener letras, números y guiones bajos')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Por favor proporcione un email válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 1 })
    .withMessage('La contraseña es requerida')
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('El refresh token es requerido')
    .isJWT()
    .withMessage('Formato de token inválido')
];

// Rutas con mejor manejo de seguridad y validaciones
router.post(
  '/register', 
  authLimiter, // Rate limiting
  registerValidation, // Validaciones
  validationMiddleware.handleValidationErrors, // Middleware de validación personalizado
  authController.register // Controlador
);

router.post(
  '/login', 
  authLimiter, // Rate limiting
  loginValidation, // Validaciones
  validationMiddleware.handleValidationErrors, // Middleware de validación personalizado
  authController.login // Controlador
);

router.post(
  '/refresh',
  refreshTokenValidation, // Validaciones para refresh token
  validationMiddleware.handleValidationErrors, // Middleware de validación personalizado
  authController.refreshToken // Controlador
);

// Nueva ruta para logout (opcional, dependiendo de tu implementación)
router.post(
  '/logout',
  authMiddleware.verifyToken, // Middleware de autenticación
  authController.logout // Controlador
);

// Ruta para verificar estado del token
router.get(
  '/verify',
  authMiddleware.verifyToken,
  authController.verifyToken
);

module.exports = router;