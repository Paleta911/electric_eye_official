const express = require('express');
const bcrypt = require('bcrypt');
const { getDB } = require('../utils/mongo');
const { requireAdmin, signToken, verificarToken } = require('../middlewares/authMiddleware');
const { createActivationKey, registerManagedUser } = require('../controllers/authController');
const {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
  passwordValidationMessage
} = require('../utils/validation');

const router = express.Router();

router.post('/registrar', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const phone = normalizePhone(req.body.phone);
    const password = req.body.password;
    const passwordError = passwordValidationMessage(password);

    if (!isValidEmail(email) || !isValidPhone(phone) || passwordError) {
      return res.status(400).json({ message: passwordError || 'Correo o teléfono inválido.' });
    }

    const db = getDB();
    const existing = await db.collection('users').findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(409).json({ message: 'El correo o teléfono ya está registrado.' });
    }

    await db.collection('users').insertOne({
      email,
      phone,
      passwordHash: await bcrypt.hash(password, 12),
      servicioActivo: false,
      estadoCuenta: 'REGISTRADO',
      claveActivacionUsada: null,
      role: 'user',
      createdAt: new Date()
    });

    return res.status(201).json({
      message: 'Usuario registrado correctamente.',
      token: signToken({ email, role: 'user' }),
      role: 'user',
      servicioActivo: false
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'El correo o teléfono ya está registrado.' });
    }
    console.error('Error interno durante el registro.');
    return res.status(500).json({ message: 'No se pudo registrar el usuario.' });
  }
});

router.post('/administrados', verificarToken, requireAdmin, registerManagedUser);
router.post('/claves-activacion', verificarToken, requireAdmin, createActivationKey);

router.post('/activar', verificarToken, async (req, res) => {
  const key = typeof req.body.clave === 'string' ? req.body.clave.trim() : '';
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(key)) {
    return res.status(400).json({ message: 'La clave de activación no es válida.' });
  }

  const db = getDB();
  if (req.user.servicioActivo) {
    return res.status(409).json({ message: 'La cuenta ya está activada.' });
  }

  try {
    const claimedKey = await db.collection('activationkeys').findOneAndUpdate(
      { clave: key, usada: false },
      { $set: { usada: true, usadaEn: new Date(), usadaPor: req.user.email } },
      { returnDocument: 'after' }
    );

    if (!claimedKey) {
      return res.status(400).json({ message: 'La clave es incorrecta o ya fue utilizada.' });
    }

    const result = await db.collection('users').updateOne(
      { email: req.user.email, servicioActivo: { $ne: true } },
      {
        $set: {
          servicioActivo: true,
          estadoCuenta: 'ACTIVO',
          claveActivacionUsada: key,
          activatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount !== 1) {
      await db.collection('activationkeys').updateOne(
        { clave: key, usadaPor: req.user.email },
        { $set: { usada: false }, $unset: { usadaEn: '', usadaPor: '' } }
      );
      return res.status(409).json({ message: 'La cuenta ya está activada.' });
    }

    return res.json({ message: 'Servicio activado correctamente.' });
  } catch (error) {
    console.error('Error interno durante la activación.');
    return res.status(500).json({ message: 'No se pudo activar el servicio.' });
  }
});

router.get('/me', verificarToken, async (req, res) => res.json({
  email: req.user.email,
  role: req.user.role,
  servicioActivo: req.user.servicioActivo,
  estadoCuenta: req.user.servicioActivo ? 'ACTIVO' : 'REGISTRADO'
}));

router.get('/verificar-sesion', verificarToken, async (req, res) => res.json({
  email: req.user.email,
  role: req.user.role,
  servicioActivo: req.user.servicioActivo
}));

module.exports = router;
