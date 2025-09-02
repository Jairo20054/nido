// Configuración de índices para MongoDB
const setupIndexes = async (mongoose) => {
  try {
    // Índices para User
    await mongoose.model('User').createIndexes();
    
    // Índices para Property
    await mongoose.model('Property').createIndexes();
    
    // Índices para Booking
    await mongoose.model('Booking').createIndexes();
    
    // Índices para Message
    await mongoose.model('Message').createIndexes();
    
    // Índices para Payment
    await mongoose.model('Payment').createIndexes();
    
    console.log('✅ Índices de MongoDB creados/actualizados correctamente');
  } catch (error) {
    console.error('❌ Error al crear índices de MongoDB:', error);
    throw error;
  }
};

module.exports = setupIndexes;
