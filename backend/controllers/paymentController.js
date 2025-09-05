// Controlador de pagos completo para NIDO
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Joi = require('joi');
const sanitize = require('mongo-sanitize');
const { validationResult } = require('express-validator');

// Constantes para estandarización
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
  VALIDATION_ERROR: 'Error de validación',
  PAYMENT_NOT_FOUND: 'Pago no encontrado',
  FORBIDDEN: 'No tienes permiso para acceder a este pago',
  BOOKING_NOT_FOUND: 'Reserva asociada no encontrada',
  STRIPE_ERROR: 'Error al procesar el pago con Stripe',
  PAYMENT_CREATED: 'Pago creado y procesado exitosamente',
  REFUND_SUCCESS: 'Reembolso procesado exitosamente',
};

// Esquema de validación para crear pago
const createPaymentSchema = Joi.object({
  bookingId: Joi.string().required().length(24).hex(),
  amount: Joi.number().positive().precision(2).required(),
  paymentMethodId: Joi.string().required(),
});

// Esquema para paginación
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

/**
 * Obtener pagos del usuario autenticado con paginación
 * @route GET /api/payments
 */
const getPaymentsByUser = async (req, res) => {
  try {
    const { error, value } = paginationSchema.validate(req.query);
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        errors: error.details.map((err) => err.message),
      });
    }

    const { page, limit } = value;
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .select('-__v -stripeChargeId'),
      Payment.countDocuments(filter),
    ]);

    if (!payments.length) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PAYMENT_NOT_FOUND,
      });
    }

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
    console.error('Error al obtener pagos:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Obtener pago por ID
 * @route GET /api/payments/:id
 */
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'ID de pago inválido',
      });
    }

    const payment = await Payment.findById(id)
      .lean()
      .select('-__v -stripeChargeId');

    if (!payment) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PAYMENT_NOT_FOUND,
      });
    }

    if (payment.user.toString() !== req.user.id) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN,
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Crear y procesar un nuevo pago con Stripe
 * @route POST /api/payments
 */
const createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        errors: errors.array(),
      });
    }

    const { error, value } = createPaymentSchema.validate(req.body);
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        errors: error.details.map((err) => err.message),
      });
    }

    const { bookingId, amount, paymentMethodId } = value;

    // Validar booking
    const booking = await Booking.findById(sanitize(bookingId));
    if (!booking) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.BOOKING_NOT_FOUND,
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN,
      });
    }

    // Procesar pago con Stripe (solo si está configurado)
    if (!stripe) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Stripe no está configurado',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: { bookingId, userId: req.user.id },
      return_url: 'https://your-app.com/return',
    });

    // Crear registro en DB
    const payment = new Payment({
      booking: bookingId,
      user: req.user.id,
      amount,
      status: paymentIntent.status,
      stripeChargeId: paymentIntent.id,
    });
    await payment.save();

    // Actualizar estado de booking
    booking.paymentStatus = 'paid';
    await booking.save();

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      data: payment,
      message: MESSAGES.PAYMENT_CREATED,
    });
  } catch (error) {
    console.error('Error al crear pago:', error);
    if (error.type === 'StripeCardError') {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.STRIPE_ERROR,
        details: error.message,
      });
    }
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Procesar reembolso de un pago
 * @route POST /api/payments/:id/refund
 */
const refundPayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'ID de pago inválido',
      });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PAYMENT_NOT_FOUND,
      });
    }

    if (payment.user.toString() !== req.user.id) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN,
      });
    }

    // Procesar reembolso con Stripe (solo si está configurado)
    if (!stripe) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Stripe no está configurado',
      });
    }

    const refund = await stripe.refunds.create({
      payment_intent: payment.stripeChargeId,
    });

    // Actualizar estado
    payment.status = 'refunded';
    payment.refundId = refund.id;
    await payment.save();

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: payment,
      message: MESSAGES.REFUND_SUCCESS,
    });
  } catch (error) {
    console.error('Error al procesar reembolso:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

module.exports = {
  getPaymentsByUser,
  getPaymentById,
  createPayment,
  refundPayment,
};
