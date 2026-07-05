const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { getBucket } = require('../utils/mongo');

const PORT = 3000;

/**
 * Descargar imagen de GridFS
 */
function getImagen(req, res) {
  const bucket = getBucket();
  const fileId = new ObjectId(req.params.id);
  res.set('Content-Type', 'image/jpeg');
  const downloadStream = bucket.openDownloadStream(fileId);

  downloadStream.on('error', () => res.status(404).json({ message: 'Imagen no encontrada' }));
  downloadStream.pipe(res);
}

/**
 * Borrar imagen y sus registros
 */
async function deleteImagen(req, res) {
  const { getDB, getBucket } = require('../utils/mongo');
  const id = new ObjectId(req.params.id);
  const db = getDB();
  const bucket = getBucket();

  await bucket.delete(id);
  await db.collection('asistencias').deleteMany({ frame_id: id });
  console.log(`🗑️ Imagen y registros eliminados para frame_id: ${id}`);
  res.json({ message: 'Imagen eliminada correctamente' });
}

/**
 * Capturar snapshot
 */
function snapshot(req, res) {
  const camId = req.params.camId;
  const rtspUrl = `rtsp://admin:Yuca99A.@192.168.1.73:554/cam/realmonitor?channel=${camId}&subtype=1`;
  const outputPath = path.join(__dirname, `snapshot-${camId}.jpg`);
  const ffmpegCmd = `ffmpeg -y -rtsp_transport tcp -i "${rtspUrl}" -frames:v 1 -q:v 2 "${outputPath}"`;

  console.log(`📸 Solicitando snapshot de cámara ${camId}`);
  exec(ffmpegCmd, (error) => {
    if (error) {
      console.error('❌ Error al capturar snapshot:', error.message);
      return res.status(500).json({ message: 'Error al capturar imagen', error: error.message });
    }

    const stream = fs.createReadStream(outputPath);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'no-store');

    stream.pipe(res);

    stream.on('end', () => fs.unlink(outputPath, () => {}));
    stream.on('error', (err) => {
      console.error('❌ Error al leer imagen:', err.message);
      res.status(500).send('Error al enviar imagen');
    });
  });
}

module.exports = { getImagen, deleteImagen, snapshot };
