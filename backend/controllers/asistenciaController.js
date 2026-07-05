const { getDB } = require('../utils/mongo');

const PORT = 3000;

async function getAsistencias(req, res) {
  const db = getDB();
  const asistencias = await db.collection('asistencias')
    .find()
    .sort({ timestamp: -1 })
    .toArray();

  const resultados = asistencias.map(item => ({
    _id: item._id,
    timestamp: item.timestamp,
    camera: item.camera_name,
    area: item.area,
    frame_id: item.frame_id,
    imagenUrl: `http://localhost:${PORT}/imagen/${item.frame_id}`
  }));

  res.json(resultados);
}

module.exports = { getAsistencias };
