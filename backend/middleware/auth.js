const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../../config/config');

/**
 * Middleware para verificar si el usuario está autenticado
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const verifyToken = async (req, res, next) => {
  try {
    // Obtener el token del encabezado de autorización
    let token = req.headers['authorization'];
    
    // Verificar si el token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso es requerido'
      });
    }
    
    // Eliminar el prefijo "Bearer " si existe
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }
    
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, config.auth.jwtSecret);
    
    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.id, '-password');
    
    // Verificar si el usuario existe
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido: usuario no encontrado'
      });
    }
    
    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }
    
    // Adjuntar el usuario al objeto de solicitud
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    
    // Manejar errores específicos de JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar si el usuario tiene un rol específico
 * @param {Array} roles - Array de roles permitidos
 * @returns {Function} Middleware
 */
const verifyRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Verificar si el usuario está autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }
      
      // Verificar si el rol del usuario está en los roles permitidos
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Permisos insuficientes'
        });
      }
      
      next();
    } catch (error) {
      console.error('Error al verificar rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

module.exports = {
  verifyToken,
  verifyRole
};
