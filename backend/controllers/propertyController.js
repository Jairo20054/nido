const Property = require('../models/Property');
const User = require('../models/User');
const Joi = require('joi'); // Para validación
const sanitize = require('mongo-sanitize'); // Para sanitizar entradas

// Constantes para mensajes y códigos de estado
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
};

// Esquema de validación para query params en getAllProperties
const searchSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  location: Joi.string().trim().max(100).optional(),
  lat: Joi.number().min(-90).max(90).optional(),
  lon: Joi.number().min(-180).max(180).optional(),
  radius: Joi.number().min(1).max(100).optional(), // km
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  propertyType: Joi.string().optional(),
}).and('lat', 'lon', 'radius'); // lat, lon, radius deben ir juntos

/**
 * Construye el filtro para búsqueda de propiedades
 * @param {Object} query - Query params
 * @returns {Object} Filtro para MongoDB
 */
const buildPropertyFilter = (query) => {
  const filter = {};

  // Sanitizar y filtrar por ciudad
  if (query.location) {
    filter.city = { $regex: sanitize(query.location), $options: 'i' };
  }

  // Filtro geoespacial
  if (query.lat && query.lon && query.radius) {
    filter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(query.lon), parseFloat(query.lat)] },
        $maxDistance: parseFloat(query.radius) * 1000, // km a metros
      },
    };
  }

  // Filtro de precio
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
    if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
  }

  // Filtro de tipo de propiedad
  if (query.propertyType) {
    filter.propertyType = sanitize(query.propertyType);
  }

  return filter;
};

/**
 * Obtener todas las propiedades con filtros y paginación
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
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

    // Ejecutar consulta con lean para mejor rendimiento
    const [properties, total] = await Promise.all([
      Property.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .select('title city price propertyType images'), // Proyección
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
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
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

    // Buscar propiedad y popular host (solo campos necesarios)
    const property = await Property.findById(id)
      .populate('host', 'name email')
      .lean()
      .select('-__v'); // Excluir campo __v

    if (!property) {
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
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const createProperty = async (req, res) => {
  try {
    // Validar body (puedes usar Joi aquí también)
    const propertyData = {
      ...req.body,
      host: req.user.id, // Desde middleware de autenticación
    };

    const property = new Property(propertyData);
    await property.save();

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
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
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

    // Verificar permisos
    if (property.host.toString() !== req.user.id) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN,
      });
    }

    // Actualizar solo campos proporcionados
    Object.assign(property, req.body);
    await property.save();

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
 * Eliminar una propiedad
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
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
    if (property.host.toString() !== req.user.id) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN,
      });
    }

    await Property.deleteOne({ _id: id });

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

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};