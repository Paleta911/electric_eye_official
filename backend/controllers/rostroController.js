const { getDB } = require('../utils/mongo');

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
      ? `http://localhost:3000/imagen/${item.frame_id}`
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
    const { nombre, puesto, estado, timestamp, frame_id } = req.body;

    if (!nombre || !estado || !timestamp) {
      return res.status(400).json({ message: 'nombre, estado y timestamp son obligatorios.' });
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
      puesto: puesto ?? 'Desconocido',
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
