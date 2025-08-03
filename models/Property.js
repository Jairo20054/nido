const mongoose = require('mongoose');

// Definir el esquema de Property
const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la propiedad es requerido'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'La ubicación es requerida'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  rating: {
    type: Number,
    min: [0, 'La calificación mínima es 0'],
    max: [5, 'La calificación máxima es 5'],
    default: 0
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    url: {
      type: String,
      required: [true, 'La URL de la imagen es requerida']
    },
    alt: {
      type: String,
      trim: true
    }
  }],
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El anfitrión es requerido']
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  propertyType: {
    type: String,
    enum: ['house', 'apartment', 'condo', 'villa'],
    required: [true, 'El tipo de propiedad es requerido']
  },
  bedrooms: {
    type: Number,
    min: [1, 'Debe haber al menos 1 habitación']
  },
  bathrooms: {
    type: Number,
    min: [1, 'Debe haber al menos 1 baño']
  },
  maxGuests: {
    type: Number,
    min: [1, 'Debe permitir al menos 1 huésped']
  },
  availability: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

// Índices para mejorar el rendimiento de las búsquedas
propertySchema.index({ location: 1, price: 1 });
propertySchema.index({ host: 1 });
propertySchema.index({ propertyType: 1 });

// Middleware para popular automáticamente el host
propertySchema.pre(/^find/, function(next) {
  this.populate('host', 'name email');
  next();
});

// Método para calcular el precio total basado en noches
propertySchema.methods.calculateTotalPrice = function(nights) {
  return this.price * nights;
};

// Método para verificar disponibilidad
propertySchema.methods.isAvailable = function() {
  return this.availability;
};

// Crear el modelo de Property
const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
