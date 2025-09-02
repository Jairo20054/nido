const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder los 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'Por favor, introduce un email válido'
    }
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir password en las consultas por defecto
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'host', 'admin'],
      message: '{VALUE} no es un rol válido'
    },
    default: 'user'
  },
  avatar: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        return !v || validator.isURL(v);
      },
      message: 'La URL del avatar no es válida'
    }
  },
  phone: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        return !v || validator.isMobilePhone(v);
      },
      message: 'El número de teléfono no es válido'
    }
  },
  bio: {
    type: String,
    maxlength: [500, 'La biografía no puede exceder los 500 caracteres'],
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    select: false
  },
  verificationExpires: {
    type: Date,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  lastLogin: {
    type: Date
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

// Actualizar la fecha de modificación antes de guardar
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Hash password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error al comparar contraseñas');
  }
};

// Método para generar token de verificación
userSchema.methods.generateVerificationToken = function() {
  this.verificationToken = crypto.randomBytes(32).toString('hex');
  this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 horas
  return this.verificationToken;
};

// Método para generar token de reseteo de contraseña
userSchema.methods.generatePasswordResetToken = function() {
  this.resetPasswordToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hora
  return this.resetPasswordToken;
};

// Índices para optimizar búsquedas
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });

// Configuración de virtuals
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Configuración de opciones del esquema
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.verificationToken;
    delete ret.verificationExpires;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);