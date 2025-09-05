// Controlador de propiedades completo para NIDO
const Property = require('../models/Property');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Joi = require('joi');
const sanitize = require('mongo-sanitize');

// Constantes para validación y mensajes
const PROPERTY_CONSTANTS = {
  MIN_TITLE_LENGTH: 10,
  MAX_TITLE_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_IMAGES: 15,
  MIN_PRICE: 1,
  MAX_PRICE: 1000000,
  MIN_GUESTS: 1,
  MAX_GUESTS: 20
};

const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  SERVER_ERROR: 500,
};

const MESSAGES = {
  SERVER_ERROR: 'Error interno del servidor',
  PROPERTY_NOT_FOUND: 'Propiedad no encontrada',
  FORBIDDEN: 'No tienes permiso para esta acción',
  VALIDATION_ERROR: 'Error de validación',
  PROPERTY_CREATED: 'Propiedad creada exitosamente',
  PROPERTY_UPDATED: 'Propiedad actualizada exitosamente',
  PROPERTY_DELETED: 'Propiedad eliminada exitosamente',
  UNAVAILABLE_DATES: 'La propiedad no está disponible en las fechas seleccionadas',
  INVALID_DATES: 'Rango de fechas inválido'
};

// Esquema de validación para query params en getAllProperties
const searchSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  location: Joi.string().trim().max(100).optional(),
  lat: Joi.number().min(-90).max(90).optional(),
  lon: Joi.number().min(-180).max(180).optional(),
  radius: Joi.number().min(1).max(100).optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  propertyType: Joi.string().valid('apartment', 'house', 'condo', 'villa', 'cabin', 'loft', 'townhouse').optional(),
  minGuests: Joi.number().integer().min(1).optional(),
  amenities: Joi.string().optional(), // Comma-separated
}).and('lat', 'lon', 'radius');

/**
 * Construye el filtro para búsqueda de propiedades
 * @param {Object} query - Query params
 * @returns {Object} Filtro para MongoDB
 */
const buildPropertyFilter = (query) => {
  const filter = { isActive: true }; // Solo propiedades activas

  // Sanitizar y filtrar por ubicación
  if (query.location) {
    filter.$or = [
      { location: { $regex: sanitize(query.location), $options: 'i' } },
      { 'address.city': { $regex: sanitize(query.location), $options: 'i' } },
      { 'address.state': { $regex: sanitize(query.location), $options: 'i' } },
      { 'address.country': { $regex: sanitize(query.location), $options: 'i' } }
    ];
  }

  // Filtro geoespacial
  if (query.lat && query.lon && query.radius) {
    filter.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(query.lon), parseFloat(query.lat)]
        },
        $maxDistance: parseFloat(query.radius) * 1000, // km a metros
      },
    };
  }

  // Filtro de precio
  if (query.minPrice || query.maxPrice) {
    filter.pricePerNight = {};
    if (query.minPrice) filter.pricePerNight.$gte = parseFloat(query.minPrice);
    if (query.maxPrice) filter.pricePerNight.$lte = parseFloat(query.maxPrice);
  }

  // Filtro de tipo de propiedad
  if (query.propertyType) {
    filter.propertyType = sanitize(query.propertyType);
  }

  // Filtro de huéspedes
  if (query.minGuests) {
    filter.maxGuests = { $gte: parseInt(query.minGuests) };
  }

  // Filtro de amenities
  if (query.amenities) {
    const amenitiesArray = query.amenities.split(',').map(a => sanitize(a.trim()));
    filter.amenities = { $in: amenitiesArray };
  }

  return filter;
};

/**
 * Verificar disponibilidad de propiedad en fechas específicas
 * @param {Object} property - Propiedad a verificar
 * @param {Date} checkIn - Fecha de check-in
 * @param {Date} checkOut - Fecha de check-out
 * @returns {Boolean} True si está disponible
 */
const checkAvailability = async (property, checkIn, checkOut) => {
  // Verificar reservas existentes que se solapen
  const conflictingBookings = await Booking.find({
    property: property._id,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      {
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn }
      }
    ]
  });

  return conflictingBookings.length === 0;
};

/**
 * Obtener todas las propiedades con filtros y paginación
 * @route GET /api/properties
 */
const getAllProperties = async (req, res) => {
  try {
    // Validar query params
    const { error, value } = searchSchema.validate(req.query, { stripUnknown: true });
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        errors: error.details.map((err) => err.message),
      });
    }

    const { page, limit, ...filters } = value;
    const skip = (page - 1) * limit;

    // Construir filtro
    const filter = buildPropertyFilter(filters);

    // Ejecutar consulta con optimización
    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('host', 'name avatar rating')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .select('-__v'),
      Property.countDocuments(filter),
    ]);

    // Generar enlaces de paginación
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/properties`;
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      next: page * limit < total ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
      prev: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
    };

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: properties,
      pagination,
    });
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Obtener una propiedad por ID
 * @route GET /api/properties/:id
 */
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'ID de propiedad inválido',
      });
    }

    // Buscar propiedad y popular datos relacionados
    const property = await Property.findById(id)
      .populate('host', 'name email avatar phone rating createdAt')
      .lean()
      .select('-__v');

    if (!property) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PROPERTY_NOT_FOUND,
      });
    }

    // Verificar si la propiedad está activa
    if (!property.isActive) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PROPERTY_NOT_FOUND,
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Crear una nueva propiedad
 * @route POST /api/properties
 */
const createProperty = async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      host: req.user.id, // Desde middleware de autenticación
    };

    // Validar datos básicos
    if (!propertyData.title || propertyData.title.length < PROPERTY_CONSTANTS.MIN_TITLE_LENGTH) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: `El título debe tener al menos ${PROPERTY_CONSTANTS.MIN_TITLE_LENGTH} caracteres`
      });
    }

    if (!propertyData.description || propertyData.description.length < PROPERTY_CONSTANTS.MIN_DESCRIPTION_LENGTH) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: `La descripción debe tener al menos ${PROPERTY_CONSTANTS.MIN_DESCRIPTION_LENGTH} caracteres`
      });
    }

    const property = new Property(propertyData);
    await property.save();

    // Popular datos del host para la respuesta
    await property.populate('host', 'name email avatar');

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      data: property,
      message: MESSAGES.PROPERTY_CREATED,
    });
  } catch (error) {
    console.error('Error al crear propiedad:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        errors,
      });
    }
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Actualizar una propiedad
 * @route PUT /api/properties/:id
 */
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'ID de propiedad inválido',
      });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PROPERTY_NOT_FOUND,
      });
    }

    // Verificar permisos (solo el host puede actualizar)
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN,
      });
    }

    // Actualizar solo campos permitidos
    const allowedUpdates = [
      'title', 'description', 'location', 'address', 'coordinates',
      'price', 'pricePerNight', 'propertyType', 'bedrooms', 'bathrooms',
      'maxGuests', 'amenities', 'images', 'availability', 'rules'
    ];

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        property[key] = req.body[key];
      }
    });

    await property.save();
    await property.populate('host', 'name email avatar');

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: property,
      message: MESSAGES.PROPERTY_UPDATED,
    });
  } catch (error) {
    console.error('Error al actualizar propiedad:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        errors,
      });
    }
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Eliminar una propiedad (desactivar)
 * @route DELETE /api/properties/:id
 */
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'ID de propiedad inválido',
      });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PROPERTY_NOT_FOUND,
      });
    }

    // Verificar permisos
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN,
      });
    }

    // Desactivar propiedad en lugar de eliminar
    property.isActive = false;
    await property.save();

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.PROPERTY_DELETED,
    });
  } catch (error) {
    console.error('Error al eliminar propiedad:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Obtener propiedades del usuario autenticado
 * @route GET /api/properties/my-properties
 */
const getMyProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find({ host: req.user.id })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Property.countDocuments({ host: req.user.id }),
    ]);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    res.json({
      success: true,
      data: properties,
      pagination,
    });
  } catch (error) {
    console.error('Error al obtener mis propiedades:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Verificar disponibilidad de propiedad
 * @route GET /api/properties/:id/availability
 */
const checkPropertyAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.query;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'ID de propiedad inválido',
      });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PROPERTY_NOT_FOUND,
      });
    }

    // Validar fechas
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.INVALID_DATES,
      });
    }

    // Verificar número de huéspedes
    if (guests && parseInt(guests) > property.maxGuests) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: `Máximo ${property.maxGuests} huéspedes permitidos`,
      });
    }

    // Verificar disponibilidad
    const isAvailable = await checkAvailability(property, startDate, endDate);

    // Calcular precio total
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalPrice = property.pricePerNight * nights;

    res.json({
      success: true,
      data: {
        isAvailable,
        nights,
        pricePerNight: property.pricePerNight,
        totalPrice,
        currency: 'USD'
      }
    });

  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  checkPropertyAvailability,
};
