// Importa el modelo de usuario
const User = require('../models/User');
// Importa el servicio de autenticación
const AuthService = require('../services/authService');
// Importa la función para validar resultados de express-validator
const { validationResult } = require('express-validator');

const authController = {
  // Registro de usuario
  register: async (req, res) => {
    try {
      // Valida los errores de la solicitud usando express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Si hay errores de validación, responde con 400 y los errores
        return res.status(400).json({ errors: errors.array() });
      }

      // Extrae los datos del cuerpo de la solicitud
      const { email, password, firstName, lastName } = req.body;

      // Verifica si el usuario ya existe en la base de datos
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // Si ya existe, responde con 409 (conflicto)
        return res.status(409).json({ message: 'User already exists' });
      }

      // Crea un nuevo usuario con los datos recibidos
      const user = new User({
        email,
        password,
        firstName,
        lastName
      });

      // Guarda el usuario en la base de datos
      await user.save();

      // Genera los tokens de autenticación (acceso y refresh)
      const tokens = AuthService.generateTokens(user);

      // Responde con el usuario creado y los tokens
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
      // Manejo de errores internos
      res.status(500).json({ message: error.message });
    }
  },

  // Inicio de sesión (login)
  login: async (req, res) => {
    try {
      // Valida los errores de la solicitud usando express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Si hay errores de validación, responde con 400 y los errores
        return res.status(400).json({ errors: errors.array() });
      }

      // Extrae email y contraseña del cuerpo de la solicitud
      const { email, password } = req.body;

      // Busca el usuario por email
      const user = await User.findOne({ email });
      if (!user) {
        // Si no existe, responde con 401 (no autorizado)
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verifica que la contraseña sea correcta
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Si la contraseña no coincide, responde con 401
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Genera los tokens de autenticación
      const tokens = AuthService.generateTokens(user);

      // Responde con los datos del usuario y los tokens
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
      // Manejo de errores internos
      res.status(500).json({ message: error.message });
    }
  },

  // Refrescar el token de acceso usando el refresh token
  refreshToken: async (req, res) => {
    try {
      // Extrae el refresh token del cuerpo de la solicitud
      const { refreshToken } = req.body;

      // Si no se proporciona, responde con 401
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
      }

      // Llama al servicio para refrescar los tokens
      const tokens = await AuthService.refreshAccessToken(refreshToken);
      // Responde con los nuevos tokens
      res.json(tokens);
    } catch (error) {
      // Si hay error (token inválido, expirado, etc.), responde con 401
      res.status(401).json({ message: error.message });
    }
  }
};

// Exporta el controlador de autenticación
module.exports = authController;