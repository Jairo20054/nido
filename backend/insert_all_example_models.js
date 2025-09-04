// Script para insertar documentos de ejemplo en todas las colecciones de modelos
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');
const Booking = require('./models/Booking');
const Message = require('./models/Message');
const Payment = require('./models/Payment');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nido');

  // Insertar usuario de ejemplo
  const user = new User({
    name: 'Usuario Ejemplo',
    email: 'ejemplo@nido.com',
    password: 'password123',
    role: 'user',
    isVerified: true
  });
  await user.save();

  // Insertar propiedad de ejemplo
  const property = new Property({
    title: 'Propiedad Ejemplo',
    description: 'Una propiedad de prueba',
    address: 'Calle Falsa 123',
    price: 1000000,
    owner: user._id
  });
  await property.save();

  // Insertar reserva de ejemplo
  const booking = new Booking({
    user: user._id,
    property: property._id,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    status: 'confirmed'
  });
  await booking.save();

  // Insertar mensaje de ejemplo
  const message = new Message({
    sender: user._id,
    receiver: user._id,
    content: 'Mensaje de prueba',
    sentAt: new Date()
  });
  await message.save();

  // Insertar pago de ejemplo
  const payment = new Payment({
    user: user._id,
    booking: booking._id,
    amount: 500000,
    status: 'completed',
    paidAt: new Date()
  });
  await payment.save();

  console.log('Documentos de ejemplo insertados en todas las colecciones.');
  await mongoose.disconnect();
}

main().catch(console.error);
