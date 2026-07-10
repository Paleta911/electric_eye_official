const crypto = require('crypto');
const { config } = require('../config');
const { closeDB, connectDB, getDB } = require('../utils/mongo');

async function run() {
  if (!config.mongoUri) throw new Error('MONGO_URI no está configurada.');
  await connectDB();
  const key = crypto.randomBytes(24).toString('base64url');
  await getDB().collection('activationkeys').insertOne({
    clave: key,
    usada: false,
    createdAt: new Date(),
    createdBy: 'cli:operator'
  });
  console.log('Clave de activación de un solo uso:');
  console.log(key);
}

run()
  .catch(error => { console.error(error.message); process.exitCode = 1; })
  .finally(closeDB);
