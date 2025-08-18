# 📋 GUÍA DE IMPLEMENTACIÓN COMPLETA - BACKEND AIRBNB

## 🎯 RESUMEN DEL PROYECTO
Sistema completo de alquiler de propiedades con:
- **Frontend**: React con autenticación, búsqueda, reservas y pagos
- **Backend**: Node.js/Express/MongoDB con arquitectura MVC
- **Funcionalidades**: Registro/login, propiedades, reservas, pagos, mensajería

---

## 📁 ESTRUCTURA ACTUAL DEL PROYECTO

```
backend/
├── config/
│   ├── config.js              # Configuración general
│   └── db.js                  # Conexión MongoDB
├── controllers/
│   ├── authController.js      # Autenticación
│   ├── userController.js      # Usuarios
│   ├── propertyController.js  # Propiedades
│   ├── bookingController.js   # Reservas
│   ├── paymentController.js   # Pagos
│   └── messageController.js   # Mensajería
├── models/
│   ├── User.js               # Modelo usuarios
│   ├── Property.js           # Modelo propiedades
│   ├── Booking.js            # Modelo reservas
│   ├── Payment.js            # Modelo pagos
│   └── Message.js            # Modelo mensajes
├── routes/
│   ├── authRoutes.js         # Rutas autenticación
│   ├── userRoutes.js         # Rutas usuarios
│   ├── propertyRoutes.js     # Rutas propiedades
│   ├── bookingRoutes.js      # Rutas reservas
│   ├── paymentRoutes.js      # Rutas pagos
│   └── messageRoutes.js      # Rutas mensajes
├── middleware/
│   ├── auth.js               # Verificación JWT
│   ├── errorHandler.js       # Manejo errores
│   └── loggingMiddleware.js  # Logging requests
├── server.js                 # Servidor principal
└── package.json              # Dependencias
```

---

## 🔧 IMPLEMENTACIÓN PASO A PASO

### **PASO 1: CONFIGURACIÓN BASE**

#### 1.1 Variables de entorno (.env)
```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/airbnb_clone

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server
PORT=5000
NODE_ENV=development
```

#### 1.2 Instalar dependencias faltantes
```bash
cd backend
npm install jsonwebtoken bcryptjs nodemailer stripe express-rate-limit joi
npm install --save-dev jest supertest @types/jest
```

---

### **PASO 2: MODELOS COMPLETOS**

#### 2.1 User.js (Actualizado)
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['guest', 'host', 'admin'],
    default: 'guest'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  stripeCustomerId: String,
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

#### 2.2 Property.js (Actualizado)
```javascript
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['apartment', 'house', 'room', 'villa'],
    required: true
  },
  location: {
    address: String,
    city: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  maxGuests: {
    type: Number,
    required: true,
    min: 1
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0
  },
  amenities: [String],
  images: [String],
  availability: [{
    startDate: Date,
    endDate: Date,
    isAvailable: { type: Boolean, default: true }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
propertySchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Property', propertySchema);
```

#### 2.3 Booking.js (Actualizado)
```javascript
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentIntentId: String,
  cancellationReason: String
}, {
  timestamps: true
});

// Validate checkIn < checkOut
bookingSchema.pre('save', function(next) {
  if (this.checkIn >= this.checkOut) {
    return next(new Error('Check-out must be after check-in'));
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
```

---

### **PASO 3: SERVICIOS CORE**

#### 3.1 authService.js
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  static generateTokens(user) {
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
  }

  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

module.exports = AuthService;
```

#### 3.2 bookingService.js
```javascript
const Booking = require('../models/Booking');
const Property = require('../models/Property');

class BookingService {
  static async checkAvailability(propertyId, checkIn, checkOut) {
    const bookings = await Booking.find({
      property: propertyId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
      ]
    });
    
    return bookings.length === 0;
  }

  static async calculatePrice(property, checkIn, checkOut, guests) {
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const basePrice = property.pricePerNight * nights;
    const guestFee = basePrice * 0.1; // 10% service fee
    const totalPrice = basePrice + guestFee;
    
    return {
      basePrice,
      guestFee,
      totalPrice,
      nights
    };
  }

  static async createBooking(bookingData) {
    const { propertyId, guestId, checkIn, checkOut, guests } = bookingData;
    
    // Check availability
    const isAvailable = await this.checkAvailability(propertyId, checkIn, checkOut);
    if (!isAvailable) {
      throw new Error('Property not available for selected dates');
    }
    
    // Get property
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }
    
    // Calculate price
    const pricing = await this.calculatePrice(property, checkIn, checkOut, guests);
    
    // Create booking
    const booking = new Booking({
      guest: guestId,
      property: propertyId,
      checkIn,
      checkOut,
      guests,
      totalPrice: pricing.totalPrice
    });
    
    await booking.save();
    return booking;
  }
}

module.exports = BookingService;
```

---

### **PASO 4: CONTROLADORES COMPLETOS**

#### 4.1 authController.js (Actualizado)
```javascript
const User = require('../models/User');
const AuthService = require('../services/authService');
const { validationResult } = require('express-validator');

const authController = {
  // Registro
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // Create user
      const user = new User({
        email,
        password,
        firstName,
        lastName
      });

      await user.save();

      // Generate tokens
      const tokens = AuthService.generateTokens(user);

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        tokens
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate tokens
      const tokens = AuthService.generateTokens(user);

      res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        tokens
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Refresh token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
      }

      const tokens = await AuthService.refreshAccessToken(refreshToken);
      res.json(tokens);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
};

module.exports = authController;
```

#### 4.2 bookingController.js (Actualizado)
```javascript
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const BookingService = require('../services/bookingService');
const { validationResult } = require('express-validator');

const bookingController = {
  // Crear reserva
  createBooking: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { propertyId, checkIn, checkOut, guests } = req.body;
      const guestId = req.user.userId;

      const booking = await BookingService.createBooking({
        propertyId,
        guestId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests
      });

      res.status(201).json({
        message: 'Booking created successfully',
        booking
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Obtener mis reservas
  getMyBookings: async (req, res) => {
    try {
      const userId = req.user.userId;
      const bookings = await Booking.find({ guest: userId })
        .populate('property', 'title images location')
        .sort({ createdAt: -1 });

      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Cancelar reserva
  cancelBooking: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const booking = await Booking.findOne({ _id: id, guest: userId });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      if (booking.status !== 'confirmed') {
        return res.status(400).json({ message: 'Cannot cancel this booking' });
      }

      booking.status = 'cancelled';
      await booking.save();

      res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = bookingController;
```

---

### **PASO 5: RUTAS COMPLETAS**

#### 5.1 authRoutes.js (Actualizado)
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

// Validaciones
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 2 }),
  body('lastName').trim().isLength({ min: 2 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
];

// Rutas
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/refresh', authController.refreshToken);

module.exports = router;
```

#### 5.2 bookingRoutes.js (Actualizado)
```javascript
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');

// Validaciones
const bookingValidation = [
  body('propertyId').isMongoId(),
  body('checkIn').isISO8601(),
  body('checkOut').isISO8601(),
  body('guests').isInt({ min: 1 })
];

// Rutas protegidas
router.post('/', auth, bookingValidation, bookingController.createBooking);
router.get('/', auth, bookingController.getMyBookings);
router.put('/:id/cancel', auth, bookingController.cancelBooking);

module.exports = router;
```

---

### **PASO 6: TESTING COMPLETO**

#### 6.1 auth.test.js
```javascript
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('tokens');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should not register user with existing email', async () => {
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(res.statusCode).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('tokens');
    });
  });
});
```

---

### **PASO 7: DOCKERIZACIÓN**

#### 7.1 Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

#### 7.2 docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/airbnb_clone
      - JWT_SECRET=your_jwt_secret
      - STRIPE_SECRET_KEY=your_stripe_key
    depends_on:
      - mongo
    volumes:
      - .:/app
      - /app/node_modules

  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
