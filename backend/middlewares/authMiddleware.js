const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { getDB } = require('../utils/mongo');

const JWT_OPTIONS = Object.freeze({
  issuer: 'electric-eye-api',
  audience: 'electric-eye-web'
});

function signToken(payload, options = {}) {
  return jwt.sign(payload, config.jwtSecret, {
    ...JWT_OPTIONS,
    expiresIn: options.expiresIn || '2h'
  });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret, JWT_OPTIONS);
}

function signImageToken(imageId) {
  return signToken({ purpose: 'image', resource: imageId }, { expiresIn: '5m' });
}

async function verificarToken(req, res, next) {
  const match = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '');
  if (!match) {
    return res.status(401).json({ message: 'Token de acceso requerido.' });
  }

  try {
    const decoded = verifyToken(match[1]);
    if (!decoded.email || decoded.purpose === '2fa') {
      return res.status(401).json({ message: 'Token de acceso inválido o expirado.' });
    }

    const db = getDB();
    const user = await db.collection('users').findOne(
      { email: decoded.email },
      { projection: { email: 1, role: 1, servicioActivo: 1 } }
    );

    if (!user) {
      return res.status(401).json({ message: 'Token de acceso inválido o expirado.' });
    }

    req.user = {
      email: user.email,
      role: user.role || 'user',
      servicioActivo: user.servicioActivo === true
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token de acceso inválido o expirado.' });
  }
}

function requireCuentaActiva(req, res, next) {
  if (!req.user?.servicioActivo) {
    return res.status(403).json({ message: 'La cuenta todavía no está activada.' });
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Se requiere una cuenta administradora.' });
  }
  return next();
}

module.exports = {
  requireAdmin,
  requireCuentaActiva,
  signImageToken,
  signToken,
  verificarToken,
  verifyToken
};
