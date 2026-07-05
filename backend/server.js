const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { connectDB } = require('./utils/mongo'); // 👈 Conexión DB

// 🌟 Inicializa app Express
const app = express();
app.use(cors());
app.use(express.json());

// 🌟 Importar rutas y controladores
const userRoutes = require('./routes/user');
const authController = require('./controllers/authController');
const imageController = require('./controllers/imageController');
const asistenciaController = require('./controllers/asistenciaController');
const rostroController = require('./controllers/rostroController');
const rostrosRoutes = require('./routes/rostros'); // 👈 Nueva ruta de rostros
const { verificarToken } = require('./middlewares/authMiddleware');

// 🌟 Arrancar todo dentro de un async
(async () => {
  try {
    await connectDB();
    console.log('✅ Base de datos lista');

    // 🌟 Rutas de usuarios
    app.use('/api/usuarios', userRoutes);

    // 🌟 Rutas de autenticación y 2FA
    app.post('/login', authController.login);
    app.post('/2fa/verify', authController.verify2FA);
    app.get('/2fa/status', verificarToken, authController.twofaStatus);
    app.post('/2fa/activate', verificarToken, authController.activate2FA);
    app.post('/2fa/confirm', verificarToken, authController.confirm2FA);
    app.post('/2fa/deactivate', verificarToken, authController.deactivate2FA);

    // 🌟 Rutas de registro adicional
    app.post('/register', authController.register);
    app.post('/login-clave', authController.loginClave);

    // 🌟 Rutas de imágenes
    app.get('/imagen/:id', imageController.getImagen);
    app.delete('/imagen/:id', verificarToken, imageController.deleteImagen);
    app.get('/snapshot/:camId', imageController.snapshot);

    // 🌟 Rutas de asistencias
    app.get('/asistencias', verificarToken, asistenciaController.getAsistencias);

    // 🌟 Rutas de rostros (GET /api/rostros y POST /api/rostros)
    app.use('/api/rostros', rostrosRoutes);

    // 🌟 Arrancar servidor
    app.listen(3000, () => console.log('🟢 Servidor corriendo en http://localhost:3000'));
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
})();
