// backend/middleware/auth.js
/**
 * verifyToken middleware (CommonJS)
 * - Busca Authorization: Bearer <token>
 * - Verifica JWT y attach `req.user`
 * - Si existe model User lo consulta para enriquecer req.user (opcional)
 */

const jwt = require('jsonwebtoken');

let User = null;
try {
  User = require('../models/User'); // si no existe, sigue funcionando sin hacer DB lookup
} catch (err) {
  User = null;
}

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }

    const secret = process.env.JWT_SECRET || 'changeme_dev_secret';
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }

    // Si payload trae id, intentamos enriquecer con usuario desde DB (si está disponible)
    if (payload && payload.id) {
      if (User) {
        try {
          const user = await User.findById(payload.id).select('-password');
          if (user) {
            req.user = { id: user._id.toString(), role: user.role || 'user', ... (user.toObject ? user.toObject() : {}) };
          } else {
            req.user = { id: payload.id, role: payload.role || 'user' };
          }
        } catch (err) {
          // no bloqueante: adjuntamos payload y seguimos
          console.warn('verifyToken: warning al buscar User:', err.message || err);
          req.user = { id: payload.id, role: payload.role || 'user' };
        }
      } else {
        req.user = { id: payload.id, role: payload.role || 'user' };
      }
    } else {
      req.user = payload || {};
    }

    next();
  } catch (err) {
    console.error('verifyToken error:', err);
    return res.status(401).json({ success: false, message: 'Autenticación fallida' });
  }
};

module.exports = { verifyToken };
