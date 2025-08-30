
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recipient: {
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
  content: {
    type: String,
    required: [true, 'El contenido del mensaje es requerido'],
    trim: true,
    minlength: [1, 'El mensaje no puede estar vacío'],
    maxlength: [1000, 'El mensaje no puede exceder 1000 caracteres']
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true // createdAt y updatedAt automáticos
});

// Índices para optimizar búsquedas
messageSchema.index({ sender: 1, recipient: 1, property: 1, createdAt: -1 });
messageSchema.index({ isRead: 1 });

// Virtual para saber si el mensaje es reciente (última hora)
messageSchema.virtual('isRecent').get(function() {
  return (Date.now() - this.createdAt.getTime()) < 60 * 60 * 1000;
});

// Configuración de salida JSON
messageSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Message', messageSchema);
