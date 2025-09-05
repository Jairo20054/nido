/**
 * Middleware avanzado para manejo de errores
 * Maneja diferentes tipos de errores de manera centralizada
 */

const mongoose = require('mongoose');

/**
 * Clases de error personalizadas
 */
class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message = 'No autorizado') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message = 'Acceso denegado') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

class NotFoundError extends Error {
  constructor(message = 'Recurso no encontrado') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ConflictError extends Error {
  constructor(message = 'Conflicto en la solicitud') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

class RateLimitError extends Error {
  constructor(message = 'Demasiadas solicitudes') {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
  }
}

/**
 * Middleware principal para manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error('Error no manejado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Errores de Mongoose - Validación
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Error de validación en los datos proporcionados',
      error: 'VALIDATION_ERROR',
      errors,
      totalErrors: errors.length
    });
  }

  // Errores de Mongoose - Duplicados
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];

    return res.status(409).json({
      success: false,
      message: 'El valor ya existe en la base de datos',
      error: 'DUPLICATE_ERROR',
      field,
      value
    });
  }

  // Errores de Mongoose - Cast (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Formato de ID inválido',
      error: 'INVALID_ID_FORMAT',
      field: err.path,
      value: err.value
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación inválido',
      error: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación expirado',
      error: 'TOKEN_EXPIRED',
      expiredAt: err.expiredAt
    });
  }

  // Errores de Multer (subida de archivos)
  if (err.name === 'MulterError') {
    let message = 'Error en la subida de archivo';

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'El archivo es demasiado grande';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Demasiados archivos';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Campo de archivo inválido';
        break;
    }

    return res.status(400).json({
      success: false,
      message,
      error: 'FILE_UPLOAD_ERROR',
      code: err.code
    });
  }

  // Errores de límite de tasa
  if (err.name === 'RateLimitError' || err.statusCode === 429) {
    return res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes. Inténtalo más tarde.',
      error: 'RATE_LIMIT_EXCEEDED',
      retryAfter: err.retryAfter || 60
    });
  }

  // Errores personalizados
  if (err.name === 'ValidationError' && err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.name,
      errors: err.errors
    });
  }

  if (err.name === 'AuthenticationError') {
    return res.status(401).json({
      success: false,
      message: err.message,
      error: 'AUTHENTICATION_ERROR'
    });
  }

  if (err.name === 'AuthorizationError') {
    return res.status(403).json({
      success: false,
      message: err.message,
      error: 'AUTHORIZATION_ERROR'
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      message: err.message,
      error: 'NOT_FOUND_ERROR'
    });
  }

  if (err.name === 'ConflictError') {
    return res.status(409).json({
      success: false,
      message: err.message,
      error: 'CONFLICT_ERROR'
    });
  }

  // Errores de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido en el cuerpo de la solicitud',
      error: 'INVALID_JSON'
    });
  }

  // Errores de base de datos
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      success: false,
      message: 'Error en la base de datos',
      error: 'DATABASE_ERROR'
    });
  }

  // Errores de red
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      message: 'Servicio no disponible temporalmente',
      error: 'SERVICE_UNAVAILABLE'
    });
  }

  // Error genérico del servidor
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Error interno del servidor' : message,
    error: statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'UNKNOWN_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};

/**
 * Middleware para manejar rutas no encontradas
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Ruta ${req.originalUrl} no encontrada`);
  next(error);
};

/**
 * Middleware para desarrollo - log detallado de errores
 */
const developmentErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('=== DETALLES DEL ERROR ===');
    console.error('Mensaje:', err.message);
    console.error('Stack:', err.stack);
    console.error('Status:', err.statusCode || 500);
    console.error('URL:', req.url);
    console.error('Método:', req.method);
    console.error('Body:', req.body);
    console.error('Query:', req.query);
    console.error('Params:', req.params);
    console.error('Headers:', req.headers);
    console.error('=======================');
  }
  next(err);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  developmentErrorHandler,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError
};
