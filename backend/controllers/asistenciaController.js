const { getDB } = require('../utils/mongo');
const { absoluteUrl } = require('../utils/http');
const { signImageToken } = require('../middlewares/authMiddleware');

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
    imagenUrl: item.frame_id
      ? absoluteUrl(req, `/imagen/${item.frame_id}?token=${encodeURIComponent(signImageToken(String(item.frame_id)))}`)
      : null
  }));

  res.json(resultados);
}

module.exports = { getAsistencias };
