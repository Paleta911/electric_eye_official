const crypto = require('crypto');
const { config } = require('../config');

function requireIngestKey(req, res, next) {
  const supplied = req.get('x-ingest-key');
  if (typeof supplied !== 'string' || !config.aiIngestKey) {
    return res.status(401).json({ message: 'Credencial de integración requerida.' });
  }

  const expectedBuffer = Buffer.from(config.aiIngestKey);
  const suppliedBuffer = Buffer.from(supplied);
  if (expectedBuffer.length !== suppliedBuffer.length
    || !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)) {
    return res.status(401).json({ message: 'Credencial de integración inválida.' });
  }

  next();
}

module.exports = { requireIngestKey };
