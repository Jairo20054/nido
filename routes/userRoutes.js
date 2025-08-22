const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// Rutas para usuarios
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser);

// Ruta para autenticación
router.post('/login', userController.loginUser);

// Ruta para obtener el perfil del usuario autenticado
router.get('/profile', verifyToken, userController.getProfile);

module.exports = router;
