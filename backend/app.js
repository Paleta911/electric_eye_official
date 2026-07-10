const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { config } = require('./config');
const { isHealthy } = require('./utils/mongo');
const { requireCuentaActiva, verificarToken } = require('./middlewares/authMiddleware');
const authController = require('./controllers/authController');
const asistenciaController = require('./controllers/asistenciaController');
const imageController = require('./controllers/imageController');
const userRoutes = require('./routes/user');
const rostrosRoutes = require('./routes/rostros');

function createRateLimiter(limit, message) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message }
  });
}

function createApp() {
  const app = express();
  app.disable('x-powered-by');

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    strictTransportSecurity: config.nodeEnv === 'production' ? undefined : false
  }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.frontendOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origen no permitido por CORS.'));
    },
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Ingest-Key'],
    maxAge: 600
  }));
  app.use(express.json({ limit: '256kb' }));

  const authLimiter = createRateLimiter(20, 'Demasiados intentos. Espera unos minutos.');
  const sensitiveLimiter = createRateLimiter(10, 'Demasiados intentos. Espera unos minutos.');

  app.get('/health', async (req, res) => {
    try {
      const database = await isHealthy();
      return res.status(database ? 200 : 503).json({ status: database ? 'ok' : 'degraded', database });
    } catch (error) {
      return res.status(503).json({ status: 'degraded', database: false });
    }
  });

  app.post('/login', authLimiter, authController.login);
  app.post('/2fa/verify', sensitiveLimiter, authController.verify2FA);
  app.get('/2fa/status', verificarToken, authController.twofaStatus);
  app.post('/2fa/activate', sensitiveLimiter, verificarToken, authController.activate2FA);
  app.post('/2fa/confirm', sensitiveLimiter, verificarToken, authController.confirm2FA);
  app.post('/2fa/deactivate', sensitiveLimiter, verificarToken, authController.deactivate2FA);

  app.post('/api/usuarios/registrar', authLimiter);
  app.post('/api/usuarios/activar', sensitiveLimiter);
  app.use('/api/usuarios', userRoutes);

  app.get('/imagen/:id', imageController.getImagen);
  app.delete('/imagen/:id', verificarToken, requireCuentaActiva, imageController.deleteImagen);
  app.get('/snapshot/:camId', sensitiveLimiter, verificarToken, requireCuentaActiva, imageController.snapshot);
  app.get('/asistencias', verificarToken, requireCuentaActiva, asistenciaController.getAsistencias);
  app.use('/api/rostros', rostrosRoutes);

  app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada.' }));
  app.use((error, req, res, next) => {
    if (error.message === 'Origen no permitido por CORS.') {
      return res.status(403).json({ message: error.message });
    }
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ message: 'La solicitud excede el tamaño permitido.' });
    }
    console.error('Error interno no controlado.');
    return res.status(500).json({ message: 'Error interno del servidor.' });
  });

  return app;
}

module.exports = { createApp };
