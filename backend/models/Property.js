const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 1000
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: 0
  },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'condo', 'villa', 'cabin', 'loft', 'townhouse'],
    required: [true, 'Property type is required']
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

// Index for search optimization
propertySchema.index({ location: 'text', title: 'text', description: 'text' });
propertySchema.index({ price: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ host: 1 });
propertySchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Property', propertySchema);
