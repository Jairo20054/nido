// Script para probar las colecciones creadas
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');
const Booking = require('./models/Booking');
const Message = require('./models/Message');
const Payment = require('./models/Payment');

async function testCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/NIDO');
    console.log('✅ Conectado a MongoDB');

    // 1. Verificar que las colecciones existen
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    console.log('📋 Colecciones encontradas:', collectionNames);

    const expectedCollections = ['users', 'properties', 'bookings', 'messages', 'payments'];
    const missingCollections = expectedCollections.filter(col => !collectionNames.includes(col));

    if (missingCollections.length > 0) {
      console.log('❌ Colecciones faltantes:', missingCollections);
    } else {
      console.log('✅ Todas las colecciones existen');
    }

    // 2. Verificar documentos en cada colección
    const userCount = await User.countDocuments();
    const propertyCount = await Property.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const messageCount = await Message.countDocuments();
    const paymentCount = await Payment.countDocuments();

    console.log('\n📊 Conteo de documentos:');
    console.log(`👤 Usuarios: ${userCount}`);
    console.log(`🏠 Propiedades: ${propertyCount}`);
    console.log(`📅 Reservas: ${bookingCount}`);
    console.log(`💬 Mensajes: ${messageCount}`);
    console.log(`💳 Pagos: ${paymentCount}`);

    // 3. Verificar estructura de documentos
    if (userCount > 0) {
      const user = await User.findOne();
      console.log('\n👤 Estructura de Usuario:', {
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      });
    }

    if (propertyCount > 0) {
      const property = await Property.findOne();
      console.log('\n🏠 Estructura de Propiedad:', {
        title: property.title,
        location: property.location,
        propertyType: property.propertyType,
        price: property.price,
        host: property.host ? 'Referencia presente' : 'Sin host'
      });
    }

    if (bookingCount > 0) {
      const booking = await Booking.findOne();
      console.log('\n📅 Estructura de Reserva:', {
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status,
        totalPrice: booking.totalPrice,
        user: booking.user ? 'Referencia presente' : 'Sin usuario',
        property: booking.property ? 'Referencia presente' : 'Sin propiedad'
      });
    }

    if (messageCount > 0) {
      const message = await Message.findOne();
      console.log('\n💬 Estructura de Mensaje:', {
        content: message.content.substring(0, 50) + '...',
        isRead: message.isRead,
        sender: message.sender ? 'Referencia presente' : 'Sin remitente',
        recipient: message.recipient ? 'Referencia presente' : 'Sin destinatario'
      });
    }

    if (paymentCount > 0) {
      const payment = await Payment.findOne();
      console.log('\n💳 Estructura de Pago:', {
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        booking: payment.booking ? 'Referencia presente' : 'Sin reserva'
      });
    }

    // 4. Probar consultas básicas
    console.log('\n🔍 Probando consultas básicas...');

    // Buscar usuario por email
    const testUser = await User.findOne({ email: 'ejemplo@nido.com' });
    if (testUser) {
      console.log('✅ Consulta de usuario por email funciona');
    }

    // Buscar propiedades por host
    if (testUser) {
      const userProperties = await Property.find({ host: testUser._id });
      console.log(`✅ Propiedades del usuario encontradas: ${userProperties.length}`);
    }

    // Buscar reservas por usuario
    if (testUser) {
      const userBookings = await Booking.find({ user: testUser._id });
      console.log(`✅ Reservas del usuario encontradas: ${userBookings.length}`);
    }

    console.log('\n🎉 Pruebas críticas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

testCollections();
