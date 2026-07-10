const bcrypt = require('bcrypt');
const crypto = require('crypto');
const qrcode = require('qrcode');
const speakeasy = require('speakeasy');
const { getDB } = require('../utils/mongo');
const { signToken, verifyToken } = require('../middlewares/authMiddleware');
const {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
  passwordValidationMessage
} = require('../utils/validation');

const DUMMY_PASSWORD_HASH = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';

async function login(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const phone = normalizePhone(req.body.phone);
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if ((!email && !phone) || !password || (email && !isValidEmail(email)) || (phone && !isValidPhone(phone))) {
      return res.status(400).json({ message: 'Introduce credenciales válidas.' });
    }

    const db = getDB();
    const user = await db.collection('users').findOne(email ? { email } : { phone });
    const passwordHash = user?.passwordHash || DUMMY_PASSWORD_HASH;
    const isValid = await bcrypt.compare(password, passwordHash);

    if (!user || !user.passwordHash || !isValid) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const role = user.role || 'user';
    if (user.twofa?.enabled && user.twofa.secret) {
      const tempToken = signToken(
        { email: user.email, purpose: '2fa' },
        { expiresIn: '5m' }
      );
      return res.json({ message: 'Se requiere verificación en dos pasos.', twofa_required: true, tempToken });
    }

    const token = signToken({ email: user.email, role });
    return res.json({
      message: 'Inicio de sesión exitoso.',
      token,
      role,
      servicioActivo: user.servicioActivo === true
    });
  } catch (error) {
    console.error('Error interno durante el inicio de sesión.');
    return res.status(500).json({ message: 'No se pudo iniciar sesión.' });
  }
}

async function verify2FA(req, res) {
  try {
    const tempToken = typeof req.body.tempToken === 'string' ? req.body.tempToken : '';
    const token = typeof req.body.token === 'string' ? req.body.token.trim() : '';
    if (!tempToken || !/^\d{6}$/.test(token)) {
      return res.status(400).json({ message: 'Introduce un código de seis dígitos.' });
    }

    const decoded = verifyToken(tempToken);
    if (decoded.purpose !== '2fa' || !decoded.email) {
      return res.status(401).json({ message: 'La verificación expiró. Inicia sesión nuevamente.' });
    }

    const db = getDB();
    const user = await db.collection('users').findOne({ email: decoded.email });
    if (!user?.twofa?.enabled || !user.twofa.secret) {
      return res.status(400).json({ message: 'La cuenta no tiene 2FA configurado.' });
    }

    const valid = speakeasy.totp.verify({
      secret: user.twofa.secret,
      encoding: 'base32',
      token,
      window: 1
    });
    if (!valid) {
      return res.status(401).json({ message: 'Código incorrecto o expirado.' });
    }

    const role = user.role || 'user';
    return res.json({
      message: 'Verificación completada.',
      token: signToken({ email: user.email, role }),
      role,
      servicioActivo: user.servicioActivo === true
    });
  } catch (error) {
    return res.status(401).json({ message: 'La verificación expiró. Inicia sesión nuevamente.' });
  }
}

async function twofaStatus(req, res) {
  const db = getDB();
  const user = await db.collection('users').findOne(
    { email: req.user.email },
    { projection: { twofa: 1 } }
  );
  return res.json({ enabled: Boolean(user?.twofa?.enabled && user.twofa.secret) });
}

async function activate2FA(req, res) {
  try {
    const db = getDB();
    const secret = speakeasy.generateSecret({ name: `Electric Eye (${req.user.email})`, length: 32 });
    await db.collection('users').updateOne(
      { email: req.user.email },
      { $set: { 'twofa.tempSecret': secret.base32 } }
    );
    const qr = await qrcode.toDataURL(secret.otpauth_url);
    return res.json({ qr });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo iniciar la configuración de 2FA.' });
  }
}

async function confirm2FA(req, res) {
  try {
    const token = typeof req.body.token === 'string' ? req.body.token.trim() : '';
    if (!/^\d{6}$/.test(token)) {
      return res.status(400).json({ message: 'Introduce un código de seis dígitos.' });
    }

    const db = getDB();
    const user = await db.collection('users').findOne({ email: req.user.email });
    const tempSecret = user?.twofa?.tempSecret;
    if (!tempSecret) {
      return res.status(400).json({ message: 'No existe una activación pendiente.' });
    }

    const verified = speakeasy.totp.verify({ secret: tempSecret, encoding: 'base32', token, window: 1 });
    if (!verified) {
      return res.status(400).json({ message: 'Código incorrecto o expirado.' });
    }

    await db.collection('users').updateOne(
      { email: req.user.email },
      {
        $set: { 'twofa.enabled': true, 'twofa.secret': tempSecret },
        $unset: { 'twofa.tempSecret': '' }
      }
    );
    return res.json({ message: '2FA activado correctamente.' });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo confirmar 2FA.' });
  }
}

async function deactivate2FA(req, res) {
  try {
    const db = getDB();
    await db.collection('users').updateOne({ email: req.user.email }, { $unset: { twofa: '' } });
    return res.json({ message: '2FA desactivado.' });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo desactivar 2FA.' });
  }
}

async function registerManagedUser(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const phone = normalizePhone(req.body.phone);
    const password = req.body.password;
    const role = req.body.role === 'admin' ? 'admin' : 'user';
    const passwordError = passwordValidationMessage(password);

    if (!isValidEmail(email) || !isValidPhone(phone) || passwordError) {
      return res.status(400).json({ message: passwordError || 'Correo o teléfono inválido.' });
    }

    const db = getDB();
    const existing = await db.collection('users').findOne({ $or: [{ email }, { phone }] });
    if (existing) return res.status(409).json({ message: 'El correo o teléfono ya está registrado.' });

    const result = await db.collection('users').insertOne({
      email,
      phone,
      passwordHash: await bcrypt.hash(password, 12),
      role,
      servicioActivo: false,
      estadoCuenta: 'REGISTRADO',
      claveActivacionUsada: null,
      createdAt: new Date()
    });
    return res.status(201).json({ message: 'Usuario creado.', id: result.insertedId });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo crear el usuario.' });
  }
}

async function createActivationKey(req, res) {
  try {
    const db = getDB();
    const key = crypto.randomBytes(24).toString('base64url');
    await db.collection('activationkeys').insertOne({
      clave: key,
      usada: false,
      createdAt: new Date(),
      createdBy: req.user.email
    });
    return res.status(201).json({ message: 'Clave creada correctamente.', clave: key });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo crear la clave.' });
  }
}

module.exports = {
  activate2FA,
  confirm2FA,
  createActivationKey,
  deactivate2FA,
  login,
  registerManagedUser,
  twofaStatus,
  verify2FA
};
