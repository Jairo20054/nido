const Property = require('../models/Property');
const User = require('../models/User');

/**
 * Obtener todas las propiedades
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getAllProperties = async (req, res) => {
  try {
    // Obtener parámetros de consulta para filtrado y paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Construir filtro de búsqueda
    const filter = {};
    
    if (req.query.location) {
      filter.location = new RegExp(req.query.location, 'i');
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    if (req.query.propertyType) {
      filter.propertyType = req.query.propertyType;
    }
    
    // Obtener propiedades con filtro y paginación
    const properties = await Property.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Obtener el total de propiedades para la paginación
    const total = await Property.countDocuments(filter);
    
    res.json({
      success: true,
      data: properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
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
    
    // Buscar propiedad por ID y popular el host
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
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
    // Crear nueva propiedad con datos del cuerpo de la solicitud
    const property = new Property({
      ...req.body,
      host: req.user.id // Asignar el usuario autenticado como host
    });
    
    // Guardar propiedad en la base de datos
    await property.save();
    
    res.status(201).json({
      success: true,
      data: property,
      message: 'Propiedad creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear propiedad:', error);
    
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
 * Actualizar una propiedad
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar propiedad por ID
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada'
      });
    }
    
    // Verificar que el usuario sea el propietario de la propiedad
    if (property.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar esta propiedad'
      });
    }
    
    // Actualizar propiedad con datos del cuerpo de la solicitud
    Object.keys(req.body).forEach(key => {
      property[key] = req.body[key];
    });
    
    // Guardar cambios en la base de datos
    await property.save();
    
    res.json({
      success: true,
      data: property,
      message: 'Propiedad actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar propiedad:', error);
    
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
 * Eliminar una propiedad
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar propiedad por ID
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada'
      });
    }
    
    // Verificar que el usuario sea el propietario de la propiedad
    if (property.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta propiedad'
      });
    }
    
    // Eliminar propiedad de la base de datos
    await property.remove();
    
    res.json({
      success: true,
      message: 'Propiedad eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar propiedad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
};
