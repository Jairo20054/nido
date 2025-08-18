const Message = require('../models/Message');
const Joi = require('joi');
const sanitize = require('mongo-sanitize');

// Constantes para estandarización
const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

const MESSAGES = {
  SERVER_ERROR: 'Error interno del servidor',
  VALIDATION_ERROR: 'Error de validación',
  MESSAGE_CREATED: 'Mensaje creado exitosamente',
  NO_MESSAGES_FOUND: 'No se encontraron mensajes',
};

// Esquema de validación para crear mensaje
const createMessageSchema = Joi.object({
  receiver: Joi.string().required().length(24).hex(), // ObjectId válido
  content: Joi.string().trim().min(1).max(1000).required(),
});

/**
 * Obtener mensajes de un usuario específico (filtrados por conversación si se proporciona receiver)
 * @param {Object} req - Objeto de solicitud (req.query.receiver opcional para conversación)
 * @param {Object} res - Objeto de respuesta
 */
const getMessagesByUser = async (req, res) => {
  try {
    const { receiver, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id },
      ],
    };

    if (receiver) {
      filter.$or = [
        { sender: req.user.id, receiver: sanitize(receiver) },
        { sender: sanitize(receiver), receiver: req.user.id },
      ];
    }

    const [messages, total] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('sender', 'name') // Popular sender con nombre (opcional, ajusta según modelo)
        .populate('receiver', 'name')
        .lean(),
      Message.countDocuments(filter),
    ]);

    if (!messages.length) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.NO_MESSAGES_FOUND,
      });
    }

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
    // Validar body
    const { error, value } = createMessageSchema.validate(req.body);
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        errors: error.details.map((err) => err.message),
      });
    }

    const messageData = {
      sender: req.user.id, // Desde autenticación
      receiver: value.receiver,
      content: sanitize(value.content), // Sanitizar para seguridad
    };

    const message = new Message(messageData);
    await message.save();

    // Opcional: Emitir evento Socket.io para real-time (si integrado)
    // req.io.emit('newMessage', message); // Asume io en req si middleware lo agrega

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      data: message,
      message: MESSAGES.MESSAGE_CREATED,
    });
  } catch (error) {
    console.error('Error al crear mensaje:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

module.exports = {
  getMessagesByUser,
  createMessage,
};