// Script para insertar documentos de ejemplo en todas las colecciones de modelos
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');
const Booking = require('./models/Booking');
const Message = require('./models/Message');
const Payment = require('./models/Payment');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/NIDO');

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
    description: 'Una propiedad de prueba con todas las comodidades necesarias',
    location: 'Ciudad Ejemplo',
    address: {
      street: 'Calle Falsa 123',
      city: 'Ciudad Ejemplo',
      state: 'Estado Ejemplo',
      zipCode: '12345',
      country: 'País Ejemplo'
    },
    coordinates: { type: 'Point', coordinates: [-70.123, 40.123] },
    price: 1000000,
    pricePerNight: 100,
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    host: user._id
  });
  await property.save();

  // Insertar reserva de ejemplo
  const booking = new Booking({
    user: user._id,
    property: property._id,
    checkIn: new Date(Date.now() + 86400000), // Mañana
    checkOut: new Date(Date.now() + 3*86400000), // En 3 días
    guests: { adults: 2, children: 0, infants: 0 },
    totalPrice: 200,
    nights: 2,
    status: 'confirmed',
    paymentStatus: 'paid'
  });
  await booking.save();

  // Insertar mensaje de ejemplo
  const message = new Message({
    sender: user._id,
    recipient: user._id,
    property: property._id,
    content: 'Mensaje de prueba sobre la propiedad'
  });
  await message.save();

  // Insertar pago de ejemplo
  const payment = new Payment({
    booking: booking._id,
    user: user._id,
    amount: 200,
    paymentMethod: 'credit_card',
    paymentIntentId: 'pi_123456789',
    status: 'completed'
  });
  await payment.save();

  console.log('Documentos de ejemplo insertados en todas las colecciones.');
  await mongoose.disconnect();
}

main().catch(console.error);
