// Controlador de reservas completo para NIDO
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * Obtener todas las reservas con filtros y paginación
 * @route GET /api/bookings
 */
const getAllBookings = async (req, res) => {
  try {
    // Obtener parámetros de consulta para filtrado y paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Construir filtro
    const filter = {};

    // Filtrar por usuario (solo si es admin o el propio usuario)
    if (req.query.userId) {
      if (req.user.role === 'admin' || req.query.userId === req.user.id) {
        filter.user = req.query.userId;
      } else {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver reservas de otros usuarios'
        });
      }
    } else {
      // Si no se especifica usuario, mostrar solo las del usuario autenticado
      filter.user = req.user.id;
    }

    // Filtrar por propiedad
    if (req.query.propertyId) {
      filter.property = req.query.propertyId;
    }

    // Filtrar por estado
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filtrar por rango de fechas
    if (req.query.startDate || req.query.endDate) {
      filter.checkIn = {};
      if (req.query.startDate) {
        filter.checkIn.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.checkIn.$lte = new Date(req.query.endDate);
      }
    }

    // Obtener reservas con filtro y paginación
    const bookings = await Booking.find(filter)
      .populate('user', 'name email avatar')
      .populate('property', 'title location images pricePerNight')
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
 * @route GET /api/bookings/:id
 */
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID de MongoDB
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'ID de reserva inválido'
      });
    }

    // Buscar reserva por ID con datos relacionados
    const booking = await Booking.findById(id)
      .populate('user', 'name email avatar phone')
      .populate('property', 'title description location address images host pricePerNight amenities')
      .populate('property.host', 'name email avatar phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Verificar permisos (usuario que hizo la reserva, host de la propiedad o admin)
    const hasPermission =
      booking.user._id.toString() === req.user.id ||
      booking.property.host._id.toString() === req.user.id ||
      req.user.role === 'admin';

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta reserva'
      });
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
 * @route GET /api/bookings/user/:userId
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
    const bookings = await Booking.find({ user: userId })
      .populate('property', 'title location images pricePerNight')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Obtener el total de reservas para la paginación
    const total = await Booking.countDocuments({ user: userId });

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
 * @route POST /api/bookings
 */
const createBooking = async (req, res) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { propertyId, checkIn, checkOut, guests, specialRequests } = req.body;

    // Validar fechas
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Fechas inválidas'
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de check-out debe ser posterior a la de check-in'
      });
    }

    // Verificar que la propiedad existe
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada'
      });
    }

    // Verificar que la propiedad esté activa
    if (!property.isActive) {
      return res.status(400).json({
        success: false,
        message: 'La propiedad no está disponible'
      });
    }

    // Verificar número de huéspedes
    if (guests.adults + guests.children > property.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `Máximo ${property.maxGuests} huéspedes permitidos`
      });
    }

    // Calcular precio total
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalPrice = property.pricePerNight * nights;

    // Crear nueva reserva
    const booking = new Booking({
      user: req.user.id,
      property: propertyId,
      checkIn: startDate,
      checkOut: endDate,
      guests,
      totalPrice,
      nights,
      specialRequests: specialRequests || ''
    });

    // Guardar reserva (la validación de disponibilidad se hace en el modelo)
    await booking.save();

    // Popular datos para la respuesta
    await booking.populate('user', 'name email avatar');
    await booking.populate('property', 'title location images pricePerNight');

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
    if (error.message && error.message.includes('no está disponible')) {
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
 * @route PUT /api/bookings/:id
 */
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    // Buscar reserva por ID
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Verificar permisos (solo el usuario que hizo la reserva puede actualizarla)
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar esta reserva'
      });
    }

    // Verificar que la reserva esté en estado pendiente para poder actualizarla
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden actualizar reservas en estado pendiente o confirmada'
      });
    }

    // Actualizar campos permitidos
    const allowedUpdates = ['checkIn', 'checkOut', 'guests', 'specialRequests'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Si se actualizan fechas, recalcular precio
    if (updates.checkIn || updates.checkOut) {
      const checkIn = new Date(updates.checkIn || booking.checkIn);
      const checkOut = new Date(updates.checkOut || booking.checkOut);

      if (checkIn >= checkOut) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de check-out debe ser posterior a la de check-in'
        });
      }

      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const property = await Property.findById(booking.property);
      updates.totalPrice = property.pricePerNight * nights;
      updates.nights = nights;
    }

    // Aplicar actualizaciones
    Object.assign(booking, updates);
    await booking.save();

    // Popular datos para la respuesta
    await booking.populate('user', 'name email avatar');
    await booking.populate('property', 'title location images pricePerNight');

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
 * Cancelar una reserva
 * @route DELETE /api/bookings/:id
 */
const cancelBooking = async (req, res) => {
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

    // Verificar permisos (usuario que hizo la reserva o admin)
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar esta reserva'
      });
    }

    // Verificar que la reserva se puede cancelar
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'La reserva ya está cancelada'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'No se pueden cancelar reservas completadas'
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

/**
 * Confirmar una reserva (para hosts)
 * @route PUT /api/bookings/:id/confirm
 */
const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar reserva por ID
    const booking = await Booking.findById(id).populate('property');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Verificar permisos (solo el host de la propiedad puede confirmar)
    if (booking.property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para confirmar esta reserva'
      });
    }

    // Verificar que la reserva esté en estado pendiente
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden confirmar reservas en estado pendiente'
      });
    }

    // Confirmar reserva
    booking.status = 'confirmed';
    await booking.save();

    // Popular datos para la respuesta
    await booking.populate('user', 'name email avatar');
    await booking.populate('property', 'title location images');

    res.json({
      success: true,
      data: booking,
      message: 'Reserva confirmada exitosamente'
    });

  } catch (error) {
    console.error('Error al confirmar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtener reservas de mis propiedades (para hosts)
 * @route GET /api/bookings/my-properties
 */
const getBookingsForMyProperties = async (req, res) => {
  try {
    // Obtener propiedades del usuario
    const userProperties = await Property.find({ host: req.user.id }).select('_id');
    const propertyIds = userProperties.map(prop => prop._id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Obtener reservas para esas propiedades
    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate('user', 'name email avatar')
      .populate('property', 'title location images')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments({ property: { $in: propertyIds } });

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
    console.error('Error al obtener reservas de mis propiedades:', error);
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
  cancelBooking,
  confirmBooking,
  getBookingsForMyProperties
};
