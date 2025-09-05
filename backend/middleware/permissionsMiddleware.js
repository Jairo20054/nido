const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Message = require('../models/Message');
const Payment = require('../models/Payment');

/**
 * Middleware de permisos avanzado
 * Controla el acceso a recursos basado en roles y propiedad
 */

/**
 * Verificar propiedad de recurso genérico
 */
const checkResourceOwnership = (Model, resourceField = 'user', populateFields = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'NOT_AUTHENTICATED'
        });
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'ID de recurso requerido',
          error: 'MISSING_RESOURCE_ID'
        });
      }

      let query = Model.findById(resourceId);
      if (populateFields.length > 0) {
        populateFields.forEach(field => {
          query = query.populate(field);
        });
      }

      const resource = await query;
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Recurso no encontrado',
          error: 'RESOURCE_NOT_FOUND'
        });
      }

      // Verificar propiedad
      const resourceOwnerId = resource[resourceField]?.toString() || resource[resourceField];
      const currentUserId = req.user.id;

      if (resourceOwnerId !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso',
          error: 'NOT_OWNER'
        });
      }

      // Adjuntar recurso a la request para uso posterior
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Error en checkResourceOwnership:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos del recurso',
        error: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

/**
 * Verificar propiedad de reserva
 */
const checkBookingOwnership = checkResourceOwnership(Booking, 'user', ['property', 'user']);

/**
 * Verificar propiedad de propiedad (listing)
 */
const checkPropertyOwnership = checkResourceOwnership(Property, 'host', ['host']);

/**
 * Verificar propiedad de mensaje
 */
const checkMessageOwnership = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'NOT_AUTHENTICATED'
      });
    }

    const messageId = req.params.id;
    const message = await Message.findById(messageId).populate('sender recipient');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado',
        error: 'MESSAGE_NOT_FOUND'
      });
    }

    // El usuario debe ser el remitente o destinatario
    const userId = req.user.id;
    const isSender = message.sender._id.toString() === userId;
    const isRecipient = message.recipient._id.toString() === userId;

    if (!isSender && !isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este mensaje',
        error: 'NOT_MESSAGE_PARTICIPANT'
      });
    }

    req.message = message;
    req.isSender = isSender;
    req.isRecipient = isRecipient;
    next();
  } catch (error) {
    console.error('Error en checkMessageOwnership:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar permisos del mensaje',
      error: 'MESSAGE_PERMISSION_ERROR'
    });
  }
};

/**
 * Verificar propiedad de pago
 */
const checkPaymentOwnership = checkResourceOwnership(Payment, 'user', ['booking', 'user']);

/**
 * Verificar si el usuario puede acceder a una propiedad
 * (útil para reservas, mensajes sobre propiedades, etc.)
 */
const checkPropertyAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'NOT_AUTHENTICATED'
      });
    }

    const propertyId = req.params.propertyId || req.body.property;
    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'ID de propiedad requerido',
        error: 'MISSING_PROPERTY_ID'
      });
    }

    const property = await Property.findById(propertyId).populate('host');
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada',
        error: 'PROPERTY_NOT_FOUND'
      });
    }

    // El usuario puede acceder si:
    // 1. Es el anfitrión de la propiedad
    // 2. Es un administrador
    const userId = req.user.id;
    const isHost = property.host._id.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isHost && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a esta propiedad',
        error: 'PROPERTY_ACCESS_DENIED'
      });
    }

    req.property = property;
    req.isHost = isHost;
    req.isAdmin = isAdmin;
    next();
  } catch (error) {
    console.error('Error en checkPropertyAccess:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar acceso a la propiedad',
      error: 'PROPERTY_ACCESS_ERROR'
    });
  }
};

/**
 * Validar ventana de cancelación para reservas
 */
const validateCancellationWindow = async (req, res, next) => {
  try {
    const booking = req.booking || req.resource;
    if (!booking) {
      return res.status(400).json({
        success: false,
        message: 'Reserva no encontrada en la solicitud',
        error: 'BOOKING_NOT_IN_REQUEST'
      });
    }

    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const timeDifference = checkInDate - now;
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    // Verificar que la cancelación sea al menos 24 horas antes del check-in
    if (hoursDifference < 24) {
      return res.status(400).json({
        success: false,
        message: 'Solo puedes cancelar reservas con al menos 24 horas de anticipación',
        error: 'CANCELLATION_WINDOW_EXPIRED',
        hoursUntilCheckIn: Math.max(0, hoursDifference)
      });
    }

    next();
  } catch (error) {
    console.error('Error en validateCancellationWindow:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar ventana de cancelación',
      error: 'CANCELLATION_VALIDATION_ERROR'
    });
  }
};

/**
 * Verificar si una reserva puede ser modificada
 */
const checkBookingModifiable = async (req, res, next) => {
  try {
    const booking = req.booking || req.resource;
    if (!booking) {
      return res.status(400).json({
        success: false,
        message: 'Reserva no encontrada en la solicitud',
        error: 'BOOKING_NOT_IN_REQUEST'
      });
    }

    // No permitir modificaciones si la reserva ya comenzó
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);

    if (now >= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'No se pueden modificar reservas que ya han comenzado',
        error: 'BOOKING_ALREADY_STARTED'
      });
    }

    // Verificar estado de la reserva
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'No se pueden modificar reservas canceladas o completadas',
        error: 'BOOKING_NOT_MODIFIABLE',
        status: booking.status
      });
    }

    next();
  } catch (error) {
    console.error('Error en checkBookingModifiable:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar modificabilidad de la reserva',
      error: 'BOOKING_MODIFICATION_ERROR'
    });
  }
};

/**
 * Verificar permisos administrativos
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado',
      error: 'NOT_AUTHENTICATED'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Se requieren permisos de administrador',
      error: 'ADMIN_REQUIRED',
      userRole: req.user.role
    });
  }

  next();
};

/**
 * Verificar permisos de anfitrión
 */
const requireHost = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado',
      error: 'NOT_AUTHENTICATED'
    });
  }

  if (req.user.role !== 'host' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Se requieren permisos de anfitrión',
      error: 'HOST_REQUIRED',
      userRole: req.user.role
    });
  }

  next();
};

module.exports = {
  checkResourceOwnership,
  checkBookingOwnership,
  checkPropertyOwnership,
  checkMessageOwnership,
  checkPaymentOwnership,
  checkPropertyAccess,
  validateCancellationWindow,
  checkBookingModifiable,
  requireAdmin,
  requireHost
};
