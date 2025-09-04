// Este script crea un usuario de ejemplo en la base de datos usando el modelo User
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nido');

  const user = new User({
    name: 'Usuario Ejemplo',
    email: 'ejemplo@nido.com',
    password: 'password123',
    role: 'user',
    isVerified: true
  });

  await user.save();
  console.log('Usuario creado:', user);
  await mongoose.disconnect();
}

main().catch(console.error);
