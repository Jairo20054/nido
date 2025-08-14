/**
 * Middleware para manejar errores
 * @param {Object} err - Objeto de error
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error no manejado:', err);
  
  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors
    });
  }
  
  // Error de unicidad de Mongoose
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Error de duplicado',
      error: 'El recurso ya existe'
    });
  }
  
  // Error de validación de tipos de Mongoose
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Solicitud inválida',
      error: 'Formato de ID inválido'
    });
  }
  
  // Error de autenticación
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
  
  // Error de token expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }
  
  // Error de permisos insuficientes
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      success: false,
      message: 'Permisos insuficientes'
    });
  }
  
  // Error de autenticación
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'No autorizado'
    });
  }
  
  // Error de acceso prohibido
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado'
    });
  }
  
  // Error de recurso no encontrado
  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      message: 'Recurso no encontrado'
    });
  }
  
  // Error de conflicto
  if (err.name === 'ConflictError') {
    return res.status(409).json({
      success: false,
      message: 'Conflicto en la solicitud'
    });
  }
  
  // Error interno del servidor
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
};

module.exports = errorHandler;
