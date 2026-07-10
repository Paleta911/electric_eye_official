const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const { config } = require('../config');
const { verifyToken } = require('../middlewares/authMiddleware');
const { getBucket, getDB } = require('../utils/mongo');

function parseObjectId(value) {
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

function getImagen(req, res) {
  const fileId = parseObjectId(req.params.id);
  if (!fileId) return res.status(400).json({ message: 'Identificador de imagen inválido.' });

  try {
    const decoded = verifyToken(typeof req.query.token === 'string' ? req.query.token : '');
    if (decoded.purpose !== 'image' || decoded.resource !== req.params.id) {
      return res.status(401).json({ message: 'El enlace de imagen no es válido.' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'El enlace de imagen expiró o no es válido.' });
  }

  res.set({ 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=60' });
  const stream = getBucket().openDownloadStream(fileId);
  stream.on('error', () => {
    if (!res.headersSent) return res.status(404).json({ message: 'Imagen no encontrada.' });
    return res.end();
  });
  return stream.pipe(res);
}

async function deleteImagen(req, res) {
  const id = parseObjectId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador de imagen inválido.' });

  try {
    await getBucket().delete(id);
    await getDB().collection('asistencias').deleteMany({ frame_id: id });
    return res.json({ message: 'Imagen eliminada correctamente.' });
  } catch (error) {
    return res.status(404).json({ message: 'Imagen no encontrada.' });
  }
}

function snapshot(req, res) {
  const camId = Number.parseInt(req.params.camId, 10);
  if (!Number.isInteger(camId) || camId < 1 || camId > 32) {
    return res.status(400).json({ message: 'Identificador de cámara inválido.' });
  }
  if (!config.cameraRtspUrl) {
    return res.status(503).json({ message: 'La cámara no está configurada.' });
  }

  const rtspUrl = config.cameraRtspUrl.replaceAll('{camId}', String(camId));
  const outputPath = path.join(os.tmpdir(), `electric-eye-${crypto.randomUUID()}.jpg`);
  const args = ['-y', '-rtsp_transport', 'tcp', '-i', rtspUrl, '-frames:v', '1', '-q:v', '2', outputPath];

  return execFile('ffmpeg', args, { timeout: 15000, windowsHide: true }, error => {
    if (error) {
      fs.unlink(outputPath, () => {});
      return res.status(502).json({ message: 'No se pudo obtener una imagen de la cámara.' });
    }

    res.set({ 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store' });
    const stream = fs.createReadStream(outputPath);
    stream.on('close', () => fs.unlink(outputPath, () => {}));
    stream.on('error', () => {
      fs.unlink(outputPath, () => {});
      if (!res.headersSent) res.status(500).json({ message: 'No se pudo leer la captura.' });
    });
    return stream.pipe(res);
  });
}

module.exports = { deleteImagen, getImagen, snapshot };
