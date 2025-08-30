// Importa el modelo de mensajes de la base de datos
const Message = require('../models/Message');
// Importa Joi para validación de datos
const Joi = require('joi');
// Importa mongo-sanitize para evitar inyección de consultas
const sanitize = require('mongo-sanitize');

// Constantes para estandarizar los códigos de estado HTTP
const STATUS_CODES = {
  OK: 200, // Éxito
  CREATED: 201, // Recurso creado
  BAD_REQUEST: 400, // Solicitud incorrecta
  NOT_FOUND: 404, // No encontrado
  SERVER_ERROR: 500, // Error interno del servidor
};

// Mensajes de respuesta estándar
const MESSAGES = {
  SERVER_ERROR: 'Error interno del servidor',
  VALIDATION_ERROR: 'Error de validación',
  MESSAGE_CREATED: 'Mensaje creado exitosamente',
  NO_MESSAGES_FOUND: 'No se encontraron mensajes',
};

// Esquema de validación para crear un mensaje nuevo
const createMessageSchema = Joi.object({
  receiver: Joi.string().required().length(24).hex(), // Debe ser un ObjectId válido
  content: Joi.string().trim().min(1).max(1000).required(), // Contenido obligatorio, entre 1 y 1000 caracteres
});

/**
 * Obtener mensajes de un usuario específico (puede filtrar por conversación si se pasa receiver)
 * @param {Object} req - Objeto de solicitud (req.query.receiver opcional para filtrar por conversación)
 * @param {Object} res - Objeto de respuesta
 */
const getMessagesByUser = async (req, res) => {
  try {
    // Extrae receiver, página y límite de la consulta
    const { receiver, page = 1, limit = 20 } = req.query;
    // Calcula cuántos documentos saltar para paginación
    const skip = (page - 1) * limit;

    // Filtro base: mensajes donde el usuario es emisor o receptor
    let filter = {
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id },
      ],
    };

    // Si se pasa receiver, filtra solo la conversación entre ambos
    if (receiver) {
      filter.$or = [
        { sender: req.user.id, receiver: sanitize(receiver) },
        { sender: sanitize(receiver), receiver: req.user.id },
      ];
    }

    // Busca mensajes y cuenta el total en paralelo
    const [messages, total] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1 }) // Ordena por fecha descendente
        .skip(skip) // Salta los primeros (paginación)
        .limit(parseInt(limit)) // Limita la cantidad de resultados
        .populate('sender', 'name') // Llena el campo sender con el nombre
        .populate('receiver', 'name') // Llena el campo receiver con el nombre
        .lean(), // Devuelve objetos planos
      Message.countDocuments(filter), // Cuenta total de mensajes
    ]);

    // Si no hay mensajes, responde con 404
    if (!messages.length) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.NO_MESSAGES_FOUND,
      });
    }

    // Responde con los mensajes y datos de paginación
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    // Manejo de errores
    console.error('Error al obtener mensajes:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Crear un nuevo mensaje
 * @param {Object} req - Objeto de solicitud (body: { receiver, content })
 * @param {Object} res - Objeto de respuesta
 */
const createMessage = async (req, res) => {
  try {
    // Valida el cuerpo de la solicitud
    const { error, value } = createMessageSchema.validate(req.body);
    if (error) {
      // Si hay error de validación, responde con 400 y detalles
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        errors: error.details.map((err) => err.message),
      });
    }

    // Prepara los datos del mensaje
    const messageData = {
      sender: req.user.id, // El usuario autenticado es el emisor
      receiver: value.receiver, // Receptor del mensaje
      content: sanitize(value.content), // Sanitiza el contenido para evitar inyección
    };

    // Crea y guarda el mensaje en la base de datos
    const message = new Message(messageData);
    await message.save();

    // (Opcional) Emitir evento en tiempo real si usas Socket.io
    // req.io.emit('newMessage', message); // Solo si tienes io en req

    // Responde con el mensaje creado
    res.status(STATUS_CODES.CREATED).json({
      success: true,
      data: message,
      message: MESSAGES.MESSAGE_CREATED,
    });
  } catch (error) {
    // Manejo de errores
    console.error('Error al crear mensaje:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

// Exporta las funciones para usarlas en las rutas
module.exports = {
  getMessagesByUser,
  createMessage,
};