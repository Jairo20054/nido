// Controlador de mensajes completo para NIDO
const Message = require('../models/Message');
const User = require('../models/User');
const Joi = require('joi');
const sanitize = require('mongo-sanitize');
const { validationResult } = require('express-validator');

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
  MESSAGE_CREATED: 'Mensaje enviado exitosamente',
  NO_MESSAGES_FOUND: 'No se encontraron mensajes',
  CONVERSATION_NOT_FOUND: 'Conversación no encontrada',
  UNAUTHORIZED: 'No tienes permiso para acceder a esta conversación'
};

// Esquema de validación para crear un mensaje nuevo
const createMessageSchema = Joi.object({
  receiverId: Joi.string().required().length(24).hex().messages({
    'string.length': 'ID de receptor inválido',
    'any.required': 'ID de receptor es requerido'
  }),
  content: Joi.string().trim().min(1).max(1000).required().messages({
    'string.min': 'El mensaje no puede estar vacío',
    'string.max': 'El mensaje no puede exceder 1000 caracteres',
    'any.required': 'Contenido del mensaje es requerido'
  }),
});

/**
 * Obtener conversaciones del usuario autenticado
 * @route GET /api/messages/conversations
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener conversaciones agrupadas por el otro participante
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender', userId] },
              then: '$receiver',
              else: '$sender'
            }
          },
          lastMessage: { $first: '$$ROOT' },
          messageCount: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'participant'
        }
      },
      {
        $unwind: '$participant'
      },
      {
        $project: {
          _id: 0,
          participant: {
            id: '$participant._id',
            name: '$participant.name',
            email: '$participant.email',
            avatar: '$participant.avatar'
          },
          lastMessage: {
            id: '$lastMessage._id',
            content: '$lastMessage.content',
            createdAt: '$lastMessage.createdAt',
            isRead: '$lastMessage.isRead'
          },
          messageCount: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Obtener mensajes de una conversación específica
 * @route GET /api/messages/conversation/:participantId
 */
const getConversationMessages = async (req, res) => {
  try {
    const { participantId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verificar que el participante existe
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Obtener mensajes de la conversación
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: participantId },
        { sender: participantId, receiver: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar');

    // Marcar mensajes como leídos
    await Message.updateMany(
      { sender: participantId, receiver: userId, isRead: false },
      { isRead: true }
    );

    const total = await Message.countDocuments({
      $or: [
        { sender: userId, receiver: participantId },
        { sender: participantId, receiver: userId }
      ]
    });

    if (!messages.length && page === 1) {
      return res.status(STATUS_CODES.OK).json({
        success: true,
        data: [],
        message: 'No hay mensajes en esta conversación'
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: messages.reverse(), // Más antiguos primero para chat
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      participant: {
        id: participant._id,
        name: participant.name,
        avatar: participant.avatar
      }
    });
  } catch (error) {
    console.error('Error al obtener mensajes de conversación:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Obtener mensajes del usuario autenticado (todos)
 * @route GET /api/messages
 */
const getMessagesByUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filtro base: mensajes donde el usuario es emisor o receptor
    const filter = {
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id },
      ],
    };

    // Busca mensajes y cuenta el total en paralelo
    const [messages, total] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name avatar')
        .populate('receiver', 'name avatar')
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
 * @route POST /api/messages
 */
const createMessage = async (req, res) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        errors: errors.array()
      });
    }

    // Validar con Joi
    const { error, value } = createMessageSchema.validate(req.body);
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        errors: error.details.map((err) => err.message),
      });
    }

    const { receiverId, content } = value;

    // Verificar que el receptor existe
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Usuario receptor no encontrado'
      });
    }

    // Verificar que no se envíe mensaje a uno mismo
    if (receiverId === req.user.id) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'No puedes enviarte mensajes a ti mismo'
      });
    }

    // Crear y guardar el mensaje
    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content: sanitize(content),
    });

    await message.save();

    // Popular datos para la respuesta
    await message.populate('sender', 'name avatar');
    await message.populate('receiver', 'name avatar');

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

/**
 * Marcar mensajes como leídos
 * @route PUT /api/messages/mark-read/:participantId
 */
const markMessagesAsRead = async (req, res) => {
  try {
    const { participantId } = req.params;
    const userId = req.user.id;

    // Marcar mensajes como leídos
    const result = await Message.updateMany(
      { sender: participantId, receiver: userId, isRead: false },
      { isRead: true }
    );

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: `${result.modifiedCount} mensajes marcados como leídos`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error al marcar mensajes como leídos:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Obtener estadísticas de mensajes
 * @route GET /api/messages/stats
 */
const getMessageStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          sentMessages: {
            $sum: { $cond: [{ $eq: ['$sender', userId] }, 1, 0] }
          },
          receivedMessages: {
            $sum: { $cond: [{ $eq: ['$receiver', userId] }, 1, 0] }
          },
          unreadMessages: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalMessages: 0,
      sentMessages: 0,
      receivedMessages: 0,
      unreadMessages: 0
    };

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de mensajes:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Eliminar un mensaje (solo el remitente puede eliminarlo)
 * @route DELETE /api/messages/:id
 */
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'ID de mensaje inválido'
      });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    // Verificar que el usuario es el remitente
    if (message.sender.toString() !== req.user.id) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Solo puedes eliminar tus propios mensajes'
      });
    }

    await Message.findByIdAndDelete(id);

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Mensaje eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

module.exports = {
  getConversations,
  getConversationMessages,
  getMessagesByUser,
  createMessage,
  markMessagesAsRead,
  getMessageStats,
  deleteMessage,
};
