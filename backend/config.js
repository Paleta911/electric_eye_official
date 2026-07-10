const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

function parsePort(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 65535 ? parsed : fallback;
}

function parseOrigins(value) {
  return (value || 'http://localhost:4200,http://127.0.0.1:4200')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
}

const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parsePort(process.env.PORT, 3000),
  host: process.env.HOST || '127.0.0.1',
  mongoUri: process.env.MONGO_URI,
  mongoDbName: process.env.MONGO_DB_NAME || 'video_database',
  jwtSecret: process.env.JWT_SECRET,
  aiIngestKey: process.env.AI_INGEST_KEY,
  cameraRtspUrl: process.env.CAMERA_RTSP_URL,
  frontendOrigins: parseOrigins(process.env.FRONTEND_ORIGINS)
});

function validateConfig() {
  const errors = [];

  if (!config.mongoUri) errors.push('MONGO_URI');
  if (!config.jwtSecret || config.jwtSecret.length < 32) errors.push('JWT_SECRET (mínimo 32 caracteres)');
  if (!config.aiIngestKey || config.aiIngestKey.length < 32) errors.push('AI_INGEST_KEY (mínimo 32 caracteres)');

  if (errors.length > 0) {
    throw new Error(`Configuración requerida inválida: ${errors.join(', ')}.`);
  }
}

module.exports = { config, validateConfig };
