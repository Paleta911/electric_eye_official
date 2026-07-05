const express = require('express');
const router = express.Router();
const { getRostros, registrarRostro } = require('../controllers/rostroController');

// GET /api/rostros
router.get('/', getRostros);

// POST /api/rostros
router.post('/', registrarRostro);

module.exports = router;
