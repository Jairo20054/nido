const mongoose = require('mongoose');

// Definir el esquema de Booking
const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'La propiedad es requerida']
  },
  startDate: {
    type: Date,
    required: [true, 'La fecha de inicio es requerida']
  },
  endDate: {
    type: Date,
    required: [true, 'La fecha de fin es requerida']
  },
  guests: {
    type: Number,
    required: [true, 'El número de huéspedes es requerido'],
    min: [1, 'Debe haber al menos 1 huésped']
  },
  totalPrice: {
    type: Number,
    required: [true, 'El precio total es requerido'],
    min: [0, 'El precio total no puede ser negativo']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  specialRequests: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

// Índices para mejorar el rendimiento de las búsquedas
bookingSchema.index({ userId: 1 });
bookingSchema.index({ propertyId: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1 });

// Middleware para popular automáticamente el usuario y la propiedad
bookingSchema.pre(/^find/, function(next) {
  this.populate('userId', 'name email')
      .populate('propertyId', 'name location price');
  next();
});

// Validación para asegurar que la fecha de inicio sea anterior a la fecha de fin
bookingSchema.path('endDate').validate(function(endDate) {
  return endDate > this.startDate;
}, 'La fecha de fin debe ser posterior a la fecha de inicio');

// Middleware para calcular el precio total antes de guardar
bookingSchema.pre('save', async function(next) {
  // Si no es una nueva reserva o no se han modificado las fechas, continuar
  if (!this.isNew && !this.isModified('startDate') && !this.isModified('endDate')) {
    return next();
  }
  
  // Obtener la propiedad para calcular el precio
  const property = await this.model('Property').findById(this.propertyId);
  if (!property) {
    return next(new Error('Property not found'));
  }
  
  // Calcular el número de noches
  const nights = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  
  // Calcular el precio total
  this.totalPrice = property.price * nights;
  
  next();
});

// Método para cancelar una reserva
bookingSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Método para confirmar una reserva
bookingSchema.methods.confirm = function() {
  this.status = 'confirmed';
  return this.save();
};

// Middleware para verificar disponibilidad antes de crear una reserva
bookingSchema.pre('save', async function(next) {
  // Solo verificar para nuevas reservas
  if (!this.isNew) return next();
  
  // Verificar si hay reservas existentes para las mismas fechas
  const existingBooking = await this.model('Booking').findOne({
    propertyId: this.propertyId,
    status: { $ne: 'cancelled' },
    $or: [
      {
        startDate: { $lt: this.endDate },
        endDate: { $gt: this.startDate }
      }
    ]
  });
  
  if (existingBooking) {
    return next(new Error('La propiedad no está disponible para las fechas seleccionadas'));
  }
  
  next();
});

// Crear el modelo de Booking
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
