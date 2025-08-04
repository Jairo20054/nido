const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');

/**
 * Obtener todas las reservas
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getAllBookings = async (req, res) => {
  try {
    // Obtener parámetros de consulta para filtrado y paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Construir filtro de búsqueda
    const filter = {};
    
    // Filtrar por usuario si se proporciona
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    
    // Filtrar por propiedad si se proporciona
    if (req.query.propertyId) {
      filter.propertyId = req.query.propertyId;
    }
    
    // Filtrar por estado si se proporciona
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Obtener reservas con filtro y paginación
    const bookings = await Booking.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Obtener el total de reservas para la paginación
    const total = await Booking.countDocuments(filter);
    
    res.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtener una reserva por ID
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar reserva por ID
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // Verificar permisos (solo el usuario que hizo la reserva o el host pueden verla)
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      // Verificar si el usuario es el host de la propiedad
      const property = await Property.findById(booking.propertyId);
      if (!property || property.host.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver esta reserva'
        });
      }
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtener reservas por ID de usuario
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getBookingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar permisos (solo el usuario dueño de las reservas o admin pueden verlas)
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver estas reservas'
      });
    }
    
    // Obtener parámetros de consulta para paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Obtener reservas del usuario con paginación
    const bookings = await Booking.find({ userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Obtener el total de reservas para la paginación
    const total = await Booking.countDocuments({ userId });
    
    res.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener reservas del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Crear una nueva reserva
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const createBooking = async (req, res) => {
  try {
    const { propertyId, startDate, endDate, guests, specialRequests } = req.body;
    
    // Validación básica
    if (!propertyId || !startDate || !endDate || !guests) {
      return res.status(400).json({
        success: false,
        message: 'propertyId, startDate, endDate y guests son requeridos'
      });
    }
    
    // Verificar que las fechas sean válidas
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({
        success: false,
        message: 'Rango de fechas inválido'
      });
    }
    
    // Verificar que la propiedad exista
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada'
      });
    }
    
    // Verificar que la propiedad esté disponible
    if (!property.isAvailable()) {
      return res.status(400).json({
        success: false,
        message: 'La propiedad no está disponible actualmente'
      });
    }
    
    // Verificar que el número de huéspedes no exceda el máximo permitido
    if (guests > property.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `El número máximo de huéspedes para esta propiedad es ${property.maxGuests}`
      });
    }
    
    // Crear nueva reserva
    const booking = new Booking({
      userId: req.user.id, // Asignar el usuario autenticado
      propertyId,
      startDate,
      endDate,
      guests,
      specialRequests
    });
    
    // Guardar reserva en la base de datos (la validación de disponibilidad se hace en el modelo)
    await booking.save();
    
    res.status(201).json({
      success: true,
      data: booking,
      message: 'Reserva creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    
    // Manejar errores de validación
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
    }
    
    // Manejar errores de disponibilidad
    if (error.message.includes('no está disponible')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Actualizar una reserva
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Buscar reserva por ID
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // Verificar permisos (solo el usuario que hizo la reserva puede actualizarla)
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar esta reserva'
      });
    }
    
    // Verificar que la reserva esté en estado pendiente para poder actualizarla
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden actualizar reservas en estado pendiente'
      });
    }
    
    // Actualizar solo campos permitidos
    const allowedUpdates = ['startDate', 'endDate', 'guests', 'specialRequests'];
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        booking[key] = updateData[key];
      }
    });
    
    // Guardar cambios en la base de datos
    await booking.save();
    
    res.json({
      success: true,
      data: booking,
      message: 'Reserva actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    
    // Manejar errores de validación
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Eliminar una reserva (cancelar)
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar reserva por ID
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // Verificar permisos (solo el usuario que hizo la reserva puede cancelarla)
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar esta reserva'
      });
    }
    
    // Verificar que la reserva esté en estado pendiente para poder cancelarla
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden cancelar reservas en estado pendiente'
      });
    }
    
    // Cancelar reserva
    await booking.cancel();
    
    res.json({
      success: true,
      message: 'Reserva cancelada exitosamente'
    });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  getBookingsByUserId,
  createBooking,
  updateBooking,
  deleteBooking
};
