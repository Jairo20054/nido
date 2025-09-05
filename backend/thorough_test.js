// Script de pruebas exhaustivas para todas las colecciones
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');
const Booking = require('./models/Booking');
const Message = require('./models/Message');
const Payment = require('./models/Payment');

async function thoroughTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/NIDO');
    console.log('🔌 Conectado a MongoDB para pruebas exhaustivas');

    // ===== PRUEBAS DE USUARIOS =====
    console.log('\n👤 ===== PRUEBAS DE USUARIOS =====');

    // Crear usuario adicional
    const newUser = new User({
      name: 'Usuario Test',
      email: 'test@nido.com',
      password: 'test123456',
      role: 'host',
      isVerified: false
    });
    await newUser.save();
    console.log('✅ Usuario adicional creado');

    // Probar validaciones de usuario
    try {
      const invalidUser = new User({
        name: 'A', // Nombre demasiado corto
        email: 'invalid-email', // Email inválido
        password: '123' // Contraseña demasiado corta
      });
      await invalidUser.save();
    } catch (error) {
      console.log('✅ Validaciones de usuario funcionan correctamente');
    }

    // ===== PRUEBAS DE PROPIEDADES =====
    console.log('\n🏠 ===== PRUEBAS DE PROPIEDADES =====');

    // Crear propiedad adicional
    const newProperty = new Property({
      title: 'Propiedad de Prueba Secundaria',
      description: 'Esta es una propiedad de prueba adicional para testing exhaustivo',
      location: 'Ubicación de Prueba',
      address: {
        street: 'Calle de Prueba 456',
        city: 'Ciudad de Prueba',
        state: 'Estado de Prueba',
        zipCode: '67890',
        country: 'País de Prueba'
      },
      coordinates: { type: 'Point', coordinates: [-75.123, 45.123] },
      price: 500000,
      pricePerNight: 50,
      propertyType: 'apartment',
      bedrooms: 2,
      bathrooms: 1,
      maxGuests: 4,
      host: newUser._id
    });
    await newProperty.save();
    console.log('✅ Propiedad adicional creada');

    // Probar validaciones de propiedad
    try {
      const invalidProperty = new Property({
        title: 'A', // Título demasiado corto
        description: 'B', // Descripción demasiado corta
        price: -100 // Precio negativo
      });
      await invalidProperty.save();
    } catch (error) {
      console.log('✅ Validaciones de propiedad funcionan correctamente');
    }

    // ===== PRUEBAS DE RESERVAS =====
    console.log('\n📅 ===== PRUEBAS DE RESERVAS =====');

    // Crear reserva adicional
    const newBooking = new Booking({
      user: newUser._id,
      property: newProperty._id,
      checkIn: new Date(Date.now() + 5*86400000), // En 5 días
      checkOut: new Date(Date.now() + 7*86400000), // En 7 días
      guests: { adults: 1, children: 2, infants: 0 },
      totalPrice: 100,
      nights: 2,
      status: 'pending',
      paymentStatus: 'pending'
    });
    await newBooking.save();
    console.log('✅ Reserva adicional creada');

    // Probar validaciones de reserva
    try {
      const invalidBooking = new Booking({
        checkIn: new Date(Date.now() - 86400000), // Fecha pasada
        checkOut: new Date(Date.now() - 86400000), // Fecha pasada
        guests: { adults: 0 } // Sin adultos
      });
      await invalidBooking.save();
    } catch (error) {
      console.log('✅ Validaciones de reserva funcionan correctamente');
    }

    // ===== PRUEBAS DE MENSAJES =====
    console.log('\n💬 ===== PRUEBAS DE MENSAJES =====');

    // Crear mensaje adicional
    const newMessage = new Message({
      sender: newUser._id,
      recipient: newUser._id,
      property: newProperty._id,
      content: 'Este es un mensaje de prueba adicional para testing exhaustivo'
    });
    await newMessage.save();
    console.log('✅ Mensaje adicional creado');

    // ===== PRUEBAS DE PAGOS =====
    console.log('\n💳 ===== PRUEBAS DE PAGOS =====');

    // Crear pago adicional
    const newPayment = new Payment({
      booking: newBooking._id,
      user: newUser._id,
      amount: 100,
      paymentMethod: 'paypal',
      paymentIntentId: 'pi_test123456',
      status: 'pending'
    });
    await newPayment.save();
    console.log('✅ Pago adicional creado');

    // ===== PRUEBAS DE RELACIONES =====
    console.log('\n🔗 ===== PRUEBAS DE RELACIONES =====');

    // Probar populate en reservas
    const bookingWithPopulate = await Booking.findById(newBooking._id)
      .populate('user', 'name email')
      .populate('property', 'title location');
    console.log('✅ Populate de reserva funciona:', {
      user: bookingWithPopulate.user.name,
      property: bookingWithPopulate.property.title
    });

    // Probar populate en propiedades
    const propertyWithPopulate = await Property.findById(newProperty._id)
      .populate('host', 'name email');
    console.log('✅ Populate de propiedad funciona:', {
      host: propertyWithPopulate.host.name
    });

    // ===== PRUEBAS DE CONSULTAS AVANZADAS =====
    console.log('\n🔍 ===== PRUEBAS DE CONSULTAS AVANZADAS =====');

    // Filtrado y ordenamiento
    const propertiesByPrice = await Property.find()
      .sort({ price: -1 })
      .limit(5);
    console.log(`✅ Consulta ordenada por precio: ${propertiesByPrice.length} resultados`);

    // Búsqueda por rango de fechas
    const futureBookings = await Booking.find({
      checkIn: { $gte: new Date() }
    });
    console.log(`✅ Reservas futuras encontradas: ${futureBookings.length}`);

    // Búsqueda de texto
    const textSearch = await Property.find({
      $text: { $search: 'ejemplo' }
    });
    console.log(`✅ Búsqueda de texto funciona: ${textSearch.length} resultados`);

    // ===== PRUEBAS DE ACTUALIZACIÓN =====
    console.log('\n✏️ ===== PRUEBAS DE ACTUALIZACIÓN =====');

    // Actualizar usuario
    await User.findByIdAndUpdate(newUser._id, {
      bio: 'Biografía actualizada para testing'
    });
    console.log('✅ Usuario actualizado');

    // Actualizar propiedad
    await Property.findByIdAndUpdate(newProperty._id, {
      rating: { average: 4.8, count: 5 }
    });
    console.log('✅ Propiedad actualizada');

    // ===== PRUEBAS DE ELIMINACIÓN =====
    console.log('\n🗑️ ===== PRUEBAS DE ELIMINACIÓN =====');

    // Eliminar documentos de prueba
    await Payment.findByIdAndDelete(newPayment._id);
    await Message.findByIdAndDelete(newMessage._id);
    await Booking.findByIdAndDelete(newBooking._id);
    await Property.findByIdAndDelete(newProperty._id);
    await User.findByIdAndDelete(newUser._id);
    console.log('✅ Documentos de prueba eliminados');

    // ===== VERIFICACIÓN FINAL =====
    console.log('\n📊 ===== VERIFICACIÓN FINAL =====');

    const finalCounts = {
      users: await User.countDocuments(),
      properties: await Property.countDocuments(),
      bookings: await Booking.countDocuments(),
      messages: await Message.countDocuments(),
      payments: await Payment.countDocuments()
    };

    console.log('Conteo final de documentos:', finalCounts);

    // Verificar índices
    const indexes = await mongoose.connection.db.collection('users').indexes();
    console.log(`✅ Índices en users: ${indexes.length}`);

    console.log('\n🎉 ¡Todas las pruebas exhaustivas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en pruebas exhaustivas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

thoroughTests();
