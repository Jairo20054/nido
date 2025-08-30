const mongoose = require('mongoose');
const validator = require('validator');

// Constantes para validación
const PROPERTY_CONSTANTS = {
  MIN_TITLE_LENGTH: 10,
  MAX_TITLE_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_IMAGES: 15,
  MIN_PRICE: 1,
  MAX_PRICE: 1000000,
  MIN_GUESTS: 1,
  MAX_GUESTS: 20
};

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    minlength: [PROPERTY_CONSTANTS.MIN_TITLE_LENGTH, `El título debe tener al menos ${PROPERTY_CONSTANTS.MIN_TITLE_LENGTH} caracteres`],
    maxlength: [PROPERTY_CONSTANTS.MAX_TITLE_LENGTH, `El título no puede exceder los ${PROPERTY_CONSTANTS.MAX_TITLE_LENGTH} caracteres`]
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    minlength: [PROPERTY_CONSTANTS.MIN_DESCRIPTION_LENGTH, `La descripción debe tener al menos ${PROPERTY_CONSTANTS.MIN_DESCRIPTION_LENGTH} caracteres`],
    maxlength: [PROPERTY_CONSTANTS.MAX_DESCRIPTION_LENGTH, `La descripción no puede exceder los ${PROPERTY_CONSTANTS.MAX_DESCRIPTION_LENGTH} caracteres`]
  },
  location: {
    type: String,
    required: [true, 'La ubicación es requerida'],
    trim: true,
    index: true
  },
  address: {
    street: {
      type: String,
      required: [true, 'La calle es requerida'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'La ciudad es requerida'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'El estado es requerido'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'El código postal es requerido'],
      trim: true,
      validate: {
        validator: function(v) {
          // Validación básica de código postal - ajustar según el país
          return /^\d{5}(-\d{4})?$/.test(v);
        },
        message: 'El formato del código postal no es válido'
      }
    },
    country: {
      type: String,
      required: [true, 'El país es requerido'],
      trim: true
    }
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.length === 2 &&
                 v[0] >= -180 && v[0] <= 180 && // longitude
                 v[1] >= -90 && v[1] <= 90;     // latitude
        },
        message: 'Las coordenadas deben ser válidas [longitud, latitud]'
      }
    }
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [PROPERTY_CONSTANTS.MIN_PRICE, `El precio mínimo es ${PROPERTY_CONSTANTS.MIN_PRICE}`],
    max: [PROPERTY_CONSTANTS.MAX_PRICE, `El precio máximo es ${PROPERTY_CONSTANTS.MAX_PRICE}`],
    validate: {
      validator: Number.isFinite,
      message: 'El precio debe ser un número válido'
    }
  },
  pricePerNight: {
    type: Number,
    required: [true, 'El precio por noche es requerido'],
    min: [PROPERTY_CONSTANTS.MIN_PRICE, `El precio por noche mínimo es ${PROPERTY_CONSTANTS.MIN_PRICE}`],
    validate: {
      validator: function(v) {
        return v <= this.price;
      },
      message: 'El precio por noche no puede ser mayor al precio total'
    }
  },
  propertyType: {
    type: String,
    enum: {
      values: ['apartment', 'house', 'condo', 'villa', 'cabin', 'loft', 'townhouse'],
      message: '{VALUE} no es un tipo de propiedad válido'
    },
    required: [true, 'El tipo de propiedad es requerido']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: 0
  },
  bathrooms: {
    type: Number,
    required: [true, 'Number of bathrooms is required'],
    min: 0
  },
  maxGuests: {
    type: Number,
    required: [true, 'Maximum guests is required'],
    min: 1
  },
  amenities: [{
    type: String,
    enum: ['wifi', 'parking', 'kitchen', 'tv', 'air_conditioning', 'heating', 'pool', 'gym', 'laundry', 'balcony', 'garden', 'pet_friendly']
  }],
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  availability: [{
    startDate: Date,
    endDate: Date,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  rules: {
    smoking: {
      type: Boolean,
      default: false
    },
    pets: {
      type: Boolean,
      default: false
    },
    parties: {
      type: Boolean,
      default: false
    },
    checkIn: String,
    checkOut: String
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
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

// Middleware pre-save para actualizar fechas
propertySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware para validar disponibilidad
propertySchema.pre('save', function(next) {
  if (this.availability && this.availability.length > 0) {
    for (let period of this.availability) {
      if (period.startDate >= period.endDate) {
        return next(new Error('La fecha de inicio debe ser anterior a la fecha de fin'));
      }
    }
  }
  next();
});

// Métodos del esquema
propertySchema.methods.isAvailableForDates = function(startDate, endDate) {
  startDate = new Date(startDate);
  endDate = new Date(endDate);
  
  if (startDate >= endDate) {
    throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
  }

  return this.availability.some(period => 
    period.isAvailable &&
    period.startDate <= startDate &&
    period.endDate >= endDate
  );
};

propertySchema.methods.calculateTotalPrice = function(nights) {
  return this.pricePerNight * nights;
};

// Virtuals
propertySchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state}, ${this.address.country}`;
});

propertySchema.virtual('isCompletelyFilled').get(function() {
  return !!(this.title && this.description && this.location && 
           this.address.street && this.address.city && this.address.state && 
           this.address.country && this.images.length > 0);
});

// Índices optimizados para búsqueda
propertySchema.index({ location: 'text', title: 'text', description: 'text' });
propertySchema.index({ price: 1, pricePerNight: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ host: 1 });
propertySchema.index({ 'coordinates.coordinates': '2dsphere' });
propertySchema.index({ 'availability.startDate': 1, 'availability.endDate': 1 });
propertySchema.index({ isActive: 1 });
propertySchema.index({ 'rating.average': -1 });

// Configuración del esquema
propertySchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

propertySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Property', propertySchema);
