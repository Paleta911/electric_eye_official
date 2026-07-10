const { getDB } = require('../utils/mongo');
const { absoluteUrl } = require('../utils/http');
const { cleanText, isIsoTimestamp } = require('../utils/validation');
const { signImageToken } = require('../middlewares/authMiddleware');

/**
 * GET /api/rostros
 * Obtener todos los registros de rostros
 */
async function getRostros(req, res) {
  const db = getDB();
  const rostros = await db.collection('rostros_detectados')
    .find()
    .sort({ timestamp: -1 })
    .toArray();

  const resultados = rostros.map(item => ({
    nombre: item.nombre,
    timestamp: item.timestamp,
    puesto: item.puesto ?? 'Desconocido',
    estado: item.estado ?? 'Desconocido',
    rostroUrl: item.frame_id
      ? absoluteUrl(req, `/imagen/${item.frame_id}?token=${encodeURIComponent(signImageToken(String(item.frame_id)))}`)
      : null
  }));

  res.json(resultados);
}

/**
 * POST /api/rostros
 * Registrar un rostro detectado
 */
async function registrarRostro(req, res) {
  try {
    const db = getDB();
    const nombre = cleanText(req.body.nombre, 80);
    const puesto = cleanText(req.body.puesto, 80) || 'Desconocido';
    const estado = cleanText(req.body.estado, 30);
    const timestamp = req.body.timestamp;
    const frame_id = req.body.frame_id;

    if (!nombre || !estado || !isIsoTimestamp(timestamp)) {
      return res.status(400).json({ message: 'nombre, estado y un timestamp válido son obligatorios.' });
    }

    const fechaHoy = timestamp.substring(0, 10); // YYYY-MM-DD

    const existente = await db.collection('rostros_detectados').findOne({
      nombre,
      timestamp: { $regex: `^${fechaHoy}` }
    });

    if (existente) {
      // Ya hay registro de hoy: actualizar
      await db.collection('rostros_detectados').updateOne(
        { _id: existente._id },
        {
          $set: {
            estado,
            timestamp,
            frame_id: frame_id ?? existente.frame_id
          }
        }
      );
      return res.status(200).json({ message: 'Registro actualizado correctamente.' });
    }

    // No hay registro: insertar
    const nuevo = {
      nombre,
      puesto,
      estado,
      timestamp,
      frame_id: frame_id ?? null
    };

    await db.collection('rostros_detectados').insertOne(nuevo);

    res.status(201).json({ message: 'Rostro registrado correctamente.' });
  } catch (error) {
    console.error('❌ Error al registrar rostro:', error);
    res.status(500).json({ message: 'Error interno al registrar rostro.' });
  }
}


module.exports = {
  getRostros,
  registrarRostro
};
