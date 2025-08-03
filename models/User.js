const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definir el esquema de User
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  role: {
    type: String,
    enum: ['user', 'host', 'admin'],
    default: 'user'
  },
  profileImage: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

// Índices para mejorar el rendimiento de las búsquedas
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Middleware para encriptar la contraseña antes de guardar
userSchema.pre('save', async function(next) {
  // Solo encriptar la contraseña si ha sido modificada
  if (!this.isModified('password')) return next();
  
  // Encriptar la contraseña
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para ocultar la contraseña al enviar la respuesta
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Middleware para eliminar referencias cuando se elimina un usuario
userSchema.pre('remove', async function(next) {
  // Eliminar propiedades asociadas al usuario
  await this.model('Property').deleteMany({ host: this._id });
  // Eliminar reservas asociadas al usuario
  await this.model('Booking').deleteMany({ userId: this._id });
  next();
});

// Crear el modelo de User
const User = mongoose.model('User', userSchema);

module.exports = User;
