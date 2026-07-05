const jwt = require('jsonwebtoken');
const { getDB } = require('../utils/mongo');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definida. Crea el archivo .env a partir de .env.example.');
}

/**
 * Middleware para validar el token y cargar los datos del usuario.
 */
async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token requerido.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const db = getDB();
    const user = await db.collection('users').findOne({ email: decoded.email });

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado.' });
    }

    req.user = {
      email: user.email,
      role: user.role,
      servicioActivo: user.servicioActivo === true
    };

    console.log(`✅ Token verificado para email: ${user.email}`);
    next();
  } catch (err) {
    console.error('❌ Error al verificar token:', err);
    return res.status(403).json({ message: 'Token inválido o expirado.' });
  }
}

/**
 * Middleware para exigir que la cuenta esté activada.
 */
function requireCuentaActiva(req, res, next) {
  if (!req.user || !req.user.servicioActivo) {
    return res.status(403).json({ message: 'Cuenta no activada. Ingresa tu clave de activación.' });
  }
  next();
}

/**
 * Middleware para exigir el rol de administrador.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Rol de administrador requerido.' });
  }
  next();
}

module.exports = {
  verificarToken,
  requireCuentaActiva,
  requireAdmin,
  JWT_SECRET
};
