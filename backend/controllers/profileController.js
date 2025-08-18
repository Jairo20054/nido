// controllers/userController.js
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Joi = require('joi');
const mongoose = require('mongoose');
const sanitize = require('mongo-sanitize');

// Logger centralizado con fallback
let logger;
try {
  logger = require('../utils/logger');
} catch {
  logger = console;
}

// Async handler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Constantes estandarizadas
const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

const MESSAGES = {
  UNAUTHORIZED: 'No autenticado',
  USER_NOT_FOUND: 'Usuario no encontrado',
  NO_VALID_FIELDS: 'No hay campos válidos para actualizar',
  INVALID_DATA: 'Datos inválidos',
  PROFILE_UPDATED: 'Perfil actualizado exitosamente',
  SERVER_ERROR: 'Error interno del servidor',
  DUPLICATE_DATA: 'Conflicto: dato duplicado',
};

// Joi schema validación perfil
const profileUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().min(6).max(30).pattern(/^\+?[0-9\s\-()]+$/).optional().allow('', null),
  bio: Joi.string().max(1000).optional().allow('', null),
  avatarUrl: Joi.string().uri().optional().allow('', null),
  location: Joi.object({
    city: Joi.string().max(50),
    country: Joi.string().max(50),
  }).optional(),
}).unknown(false);

// Campos protegidos
const IMMUTABLE_FIELDS = ['_id', 'id', 'email', 'password', 'role', 'createdAt', 'updatedAt'];

// Sanitizar input y quitar campos inmutables
const sanitizeInput = (input) => {
  const sanitized = {};
  Object.entries(input).forEach(([key, value]) => {
    if (IMMUTABLE_FIELDS.includes(key)) return;
    sanitized[key] = typeof value === 'string'
      ? sanitize(value.trim())
      : sanitize(value);
  });
  return sanitized;
};

/**
 * @desc Obtener perfil con relaciones
 * @route GET /api/user/profile
 * @access Privado
 */
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.UNAUTHORIZED,
    });
  }

  try {
    const user = await User.findById(userId)
      .select('-password -__v -resetToken -resetExpire -stripeCustomerId')
      .populate({
        path: 'properties',
        model: Property,
        select: 'title city price featured',
      })
      .populate({
        path: 'bookings',
        model: Booking,
        select: 'property dates status',
        populate: { path: 'property', select: 'title city' },
      })
      .lean();

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND,
      });
    }

    res.status(HTTP_STATUS.OK).json({ success: true, data: user });
  } catch (error) {
    logger.error('Error al obtener perfil', error);
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
});

/**
 * @desc Actualizar perfil del usuario
 * @route PATCH /api/user/profile
 * @access Privado
 */
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.UNAUTHORIZED,
    });
  }

  // Validación con Joi
  const { error, value } = profileUpdateSchema.validate(req.body, {
    stripUnknown: true,
    abortEarly: false,
  });

  if (error) {
    logger.warn('Validación de perfil fallida', { details: error.details });
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: MESSAGES.INVALID_DATA,
      errors: error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      })),
    });
  }

  // Sanitizar datos
  const safeUpdate = sanitizeInput(value);

  if (Object.keys(safeUpdate).length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: MESSAGES.NO_VALID_FIELDS,
    });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: safeUpdate },
      {
        new: true,
        runValidators: true,
        context: 'query',
        projection: { password: 0, __v: 0 },
      }
    )
      .populate({
        path: 'properties',
        model: Property,
        select: 'title city price featured',
      })
      .populate({
        path: 'bookings',
        model: Booking,
        select: 'property dates status',
        populate: { path: 'property', select: 'title city' },
      })
      .lean();

    if (!updatedUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND,
      });
    }

    // Auditoría
    logger.info('Perfil actualizado', {
      userId,
      updatedFields: Object.keys(safeUpdate),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.PROFILE_UPDATED,
      data: updatedUser,
    });
  } catch (error) {
    logger.error('Error al actualizar perfil', error);

    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.INVALID_DATA,
        errors,
      });
    }

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: MESSAGES.DUPLICATE_DATA,
        field: duplicateField,
        value: error.keyValue[duplicateField],
      });
    }

    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
});

module.exports = {
  getProfile,
  updateProfile,
};
