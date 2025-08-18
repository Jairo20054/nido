const Payment = require('../models/Payment');
const Booking = require('../models/Booking'); // Asumido para validación de booking
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Joi = require('joi');
const sanitize = require('mongo-sanitize');

// Constantes para estandarización (facilita cambios globales y testing)
const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  SERVER_ERROR: 500,
};

const ERROR_MESSAGES = {
  SERVER_ERROR: 'Error interno del servidor. Por favor, contacta soporte.',
  VALIDATION_ERROR: 'Error de validación en los datos proporcionados.',
  PAYMENT_NOT_FOUND: 'Pago no encontrado.',
  FORBIDDEN: 'No tienes permiso para acceder a este pago.',
  BOOKING_NOT_FOUND: 'Reserva asociada no encontrada.',
  STRIPE_ERROR: 'Error al procesar el pago con Stripe.',
  PAYMENT_CREATED: 'Pago creado y procesado exitosamente.',
  REFUND_SUCCESS: 'Reembolso procesado exitosamente.',
};

// Esquema de validación para crear pago
const createPaymentSchema = Joi.object({
  bookingId: Joi.string().required().length(24).hex(), // ObjectId válido
  amount: Joi.number().positive().precision(2).required(), // Monto positivo con 2 decimales
  paymentMethodId: Joi.string().required(), // Token o método de pago de Stripe
});

// Esquema para paginación (común en queries)
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

/**
 * Obtener pagos de un usuario específico con paginación
 * @param {Object} req - Objeto de solicitud (query: page, limit)
 * @param {Object} res - Objeto de respuesta
 * @description Solo retorna pagos del usuario autenticado para cumplir con privacidad (GDPR-compliant).
 */
const getPaymentsByUser = async (req, res) => {
  try {
    // Validar paginación
    const { error, value } = paginationSchema.validate(req.query);
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errors: error.details.map((err) => err.message),
      });
    }

    const { page, limit } = value;
    const skip = (page - 1) * limit;

    // Filtro por usuario autenticado
    const filter = { userId: req.user.id };

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .select('-__v -stripeChargeId'), // Proyección: Excluir sensibles
      Payment.countDocuments(filter),
    ]);

    if (!payments.length) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.PAYMENT_NOT_FOUND,
      });
    }

    // Logging estructurado para observabilidad
    console.log(`[INFO] User ${req.user.id} fetched ${payments.length} payments on page ${page}`);

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(`[ERROR] Error fetching payments for user ${req.user?.id}:`, error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Obtener un pago por ID
 * @param {Object} req - Objeto de solicitud (params: id)
 * @param {Object} res - Objeto de respuesta
 * @description Verifica que el pago pertenezca al usuario autenticado.
 */
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'ID de pago inválido.',
      });
    }

    const payment = await Payment.findById(id)
      .lean()
      .select('-__v -stripeChargeId');

    if (!payment) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.PAYMENT_NOT_FOUND,
      });
    }

    // Verificar ownership
    if (payment.userId.toString() !== req.user.id) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN,
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error(`[ERROR] Error fetching payment ${req.params.id}:`, error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Crear y procesar un nuevo pago con Stripe
 * @param {Object} req - Objeto de solicitud (body: { bookingId, amount, paymentMethodId })
 * @param {Object} res - Objeto de respuesta
 * @description Integra Stripe para cobro real, valida booking, y actualiza status.
 */
const createPayment = async (req, res) => {
  try {
    // Validar body
    const { error, value } = createPaymentSchema.validate(req.body);
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errors: error.details.map((err) => err.message),
      });
    }

    const { bookingId, amount, paymentMethodId } = value;

    // Validar booking existe y pertenece al usuario
    const booking = await Booking.findById(sanitize(bookingId));
    if (!booking) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.BOOKING_NOT_FOUND,
      });
    }
    if (booking.userId.toString() !== req.user.id) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN,
      });
    }

    // Procesar pago con Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // En centavos, redondeo para precisión
      currency: 'usd', // Ajusta según tu app
      payment_method: paymentMethodId,
      confirm: true,
      metadata: { bookingId, userId: req.user.id }, // Para tracing
      return_url: 'https://your-app.com/return', // Para 3D Secure si aplica
    });

    // Crear registro en DB
    const payment = new Payment({
      bookingId,
      userId: req.user.id,
      amount,
      status: paymentIntent.status,
      stripeChargeId: paymentIntent.id,
    });
    await payment.save();

    // Actualizar booking status
    booking.paymentStatus = 'paid';
    await booking.save();

    // Logging y posible emisión de evento (e.g., para SNS o SQS en AWS)
    console.log(`[INFO] Payment created: ${payment._id} for user ${req.user.id}`);
    // Ejemplo: await publishToSQS({ event: 'payment_created', paymentId: payment._id });

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      data: payment,
      message: ERROR_MESSAGES.PAYMENT_CREATED,
    });
  } catch (error) {
    console.error(`[ERROR] Error creating payment for user ${req.user?.id}:`, error);
    if (error.type === 'StripeCardError') {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.STRIPE_ERROR,
        details: error.message,
      });
    }
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Procesar reembolso de un pago
 * @param {Object} req - Objeto de solicitud (params: id)
 * @param {Object} res - Objeto de respuesta
 * @description Reembolsa vía Stripe y actualiza status.
 */
const refundPayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'ID de pago inválido.',
      });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.PAYMENT_NOT_FOUND,
      });
    }

    // Verificar ownership
    if (payment.userId.toString() !== req.user.id) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN,
      });
    }

    // Procesar reembolso con Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripeChargeId,
    });

    // Actualizar status
    payment.status = 'refunded';
    payment.refundId = refund.id;
    await payment.save();

    console.log(`[INFO] Refund processed: ${payment._id} for user ${req.user.id}`);

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: payment,
      message: ERROR_MESSAGES.REFUND_SUCCESS,
    });
  } catch (error) {
    console.error(`[ERROR] Error refunding payment ${req.params.id}:`, error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

module.exports = {
  getPaymentsByUser,
  getPaymentById,
  createPayment,
  refundPayment,
};