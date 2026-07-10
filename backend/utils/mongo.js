const { MongoClient, GridFSBucket } = require('mongodb');
const { config } = require('../config');

let db;
let bucket;
let clientInstance;

async function ensureIndexes() {
  await Promise.all([
    db.collection('users').createIndex(
      { email: 1 },
      { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
    ),
    db.collection('users').createIndex(
      { phone: 1 },
      { unique: true, sparse: true }
    ),
    db.collection('activationkeys').createIndex({ clave: 1 }, { unique: true }),
    db.collection('activationkeys').createIndex({ createdAt: -1 }),
    db.collection('rostros_detectados').createIndex({ timestamp: -1 }),
    db.collection('asistencias').createIndex({ timestamp: -1 })
  ]);
}

async function connectDB() {
  if (db) return db;
  clientInstance = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  await clientInstance.connect();
  db = clientInstance.db(config.mongoDbName);
  bucket = new GridFSBucket(db, { bucketName: 'fs' });
  await ensureIndexes();
  return db;
}

function getDB() {
  if (!db) throw new Error('La base de datos no está inicializada.');
  return db;
}

function getBucket() {
  if (!bucket) throw new Error('GridFS no está inicializado.');
  return bucket;
}

async function isHealthy() {
  if (!db) return false;
  await db.command({ ping: 1 });
  return true;
}

async function closeDB() {
  if (clientInstance) await clientInstance.close();
  clientInstance = undefined;
  db = undefined;
  bucket = undefined;
}

module.exports = { closeDB, connectDB, getBucket, getDB, isHealthy };
