const User = require('../models/User');
const AuthService = require('../services/authService');
const { validationResult } = require('express-validator');

const authController = {
  // Registro
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // Create user
      const user = new User({
        email,
        password,
        firstName,
        lastName
      });

      await user.save();

      // Generate tokens
      const tokens = AuthService.generateTokens(user);

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
      res.status(500).json({ message: error.message });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate tokens
      const tokens = AuthService.generateTokens(user);

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
      res.status(500).json({ message: error.message });
    }
  },

  // Refresh token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
      }

      const tokens = await AuthService.refreshAccessToken(refreshToken);
      res.json(tokens);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
};

module.exports = authController;