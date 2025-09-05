// backend/middleware/auth.js
/**
 * Middleware de autenticación avanzado
 * - Verificación de JWT tokens
 * - Control de roles y permisos
 * - Refresh tokens
 * - Protección de rutas
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Configuración de JWT
const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'changeme_dev_secret',
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'changeme_refresh_secret',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};

/**
 * Middleware principal para verificar tokens JWT
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso no proporcionado',
        error: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido',
        error: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET);

    // Buscar usuario en base de datos
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'USER_NOT_FOUND'
      });
    }

    // Verificar si el usuario está verificado (opcional)
    if (user.isVerified === false) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no verificado',
        error: 'USER_NOT_VERIFIED'
      });
    }

    // Adjuntar información del usuario a la request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar
    };

    next();
  } catch (error) {
    console.error('Error en verifyToken:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        error: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        error: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Error de autenticación',
      error: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'NOT_AUTHENTICATED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos suficientes',
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware para verificar si el usuario es propietario del recurso
 */
const requireOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'NOT_AUTHENTICATED'
      });
    }

    const resourceId = req.params.id || req.body[resourceField];
    const userId = req.user.id;

    if (resourceId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso',
        error: 'NOT_OWNER'
      });
    }

    next();
  };
};

/**
 * Middleware opcional - no requiere autenticación pero adjunta usuario si existe
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_CONFIG.SECRET);
    const user = await User.findById(decoded.id).select('-password');

    req.user = user ? {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar
    } : null;

    next();
  } catch (error) {
    // En autenticación opcional, ignoramos errores y continuamos sin usuario
    req.user = null;
    next();
  }
};

/**
 * Generar tokens de acceso y refresh
 */
const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, JWT_CONFIG.SECRET, {
    expiresIn: JWT_CONFIG.EXPIRES_IN
  });

  const refreshToken = jwt.sign(payload, JWT_CONFIG.REFRESH_SECRET, {
    expiresIn: JWT_CONFIG.REFRESH_EXPIRES_IN
  });

  return { accessToken, refreshToken };
};

/**
 * Verificar token de refresh
 */
const verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_CONFIG.REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  } catch (error) {
    throw new Error('Token de refresh inválido');
  }
};

module.exports = {
  verifyToken,
  requireRole,
  requireOwnership,
  optionalAuth,
  generateTokens,
  verifyRefreshToken,
  JWT_CONFIG
};
