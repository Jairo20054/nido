
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    index: true
  },
  checkIn: {
    type: Date,
    required: [true, 'La fecha de check-in es requerida'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'La fecha de check-in debe ser futura'
    }
  },
  checkOut: {
    type: Date,
    required: [true, 'La fecha de check-out es requerida']
  },
  guests: {
    adults: {
      type: Number,
      required: true,
      min: [1, 'Debe haber al menos 1 adulto']
    },
    children: {
      type: Number,
      default: 0,
      min: 0
    },
    infants: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'El precio total no puede ser negativo']
  },
  nights: {
    type: Number,
    required: true,
    min: [1, 'Debe haber al menos 1 noche']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Las solicitudes especiales no pueden exceder 500 caracteres']
  },
  cancellationReason: {
    type: String,
    maxlength: 300
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Validar que checkOut sea después de checkIn
bookingSchema.pre('save', function(next) {
  if (this.checkOut <= this.checkIn) {
    return next(new Error('La fecha de check-out debe ser posterior a la de check-in'));
  }
  this.updatedAt = new Date();
  next();
});

// Virtual para duración de la reserva
bookingSchema.virtual('duration').get(function() {
  if (this.checkIn && this.checkOut) {
    return Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Método para verificar si la reserva se puede cancelar
bookingSchema.methods.canBeCancelled = function() {
  return this.status === 'pending' || this.status === 'confirmed';
};

// Índices para optimización
bookingSchema.index({ user: 1, property: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Configuración de salida JSON
bookingSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
