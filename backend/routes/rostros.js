const express = require('express');
const router = express.Router();
const { getRostros, registrarRostro } = require('../controllers/rostroController');
const { requireCuentaActiva, verificarToken } = require('../middlewares/authMiddleware');
const { requireIngestKey } = require('../middlewares/securityMiddleware');

// GET /api/rostros
router.get('/', verificarToken, requireCuentaActiva, getRostros);

// POST /api/rostros
router.post('/', requireIngestKey, registrarRostro);

module.exports = router;
