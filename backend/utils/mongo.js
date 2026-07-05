const { MongoClient, GridFSBucket } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || 'video_database';

let db;
let bucket;
let clientInstance;

async function connectDB() {
  if (db) {
    console.log('ℹ️ La base de datos ya está inicializada.');
    return;
  }

  if (!uri) {
    throw new Error('MONGO_URI no está definida. Crea el archivo .env a partir de .env.example.');
  }

  clientInstance = await MongoClient.connect(uri);

  db = clientInstance.db(dbName);
  bucket = new GridFSBucket(db, { bucketName: 'fs' });

  console.log('🟢 Conectado a MongoDB y GridFS listo');
}

function getDB() {
  if (!db) throw new Error('❌ La base de datos no está inicializada. Llama a connectDB() primero.');
  return db;
}

function getBucket() {
  if (!bucket) throw new Error('❌ El bucket de GridFS no está inicializado.');
  return bucket;
}

process.on('SIGINT', async () => {
  if (clientInstance) {
    await clientInstance.close();
    console.log('🔴 Conexión a MongoDB cerrada.');
  }
  process.exit(0);
});

module.exports = { connectDB, getDB, getBucket };
