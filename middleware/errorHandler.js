// Middleware para manejar errores
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }
  
  // Error de autenticación
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }
  
  // Error de acceso prohibido
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden'
    });
  }
  
  // Error de recurso no encontrado
  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }
  
  // Error de conflicto
  if (err.name === 'ConflictError') {
    return res.status(409).json({
      success: false,
      message: 'Conflict'
    });
  }
  
  // Error interno del servidor
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

module.exports = errorHandler;
