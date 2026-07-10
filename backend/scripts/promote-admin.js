const { config } = require('../config');
const { closeDB, connectDB, getDB } = require('../utils/mongo');
const { isValidEmail, normalizeEmail } = require('../utils/validation');

async function run() {
  const email = normalizeEmail(process.argv[2]);
  if (!config.mongoUri) throw new Error('MONGO_URI no está configurada.');
  if (!isValidEmail(email)) throw new Error('Uso: npm run promote-admin -- usuario@ejemplo.com');

  await connectDB();
  const result = await getDB().collection('users').updateOne({ email }, { $set: { role: 'admin' } });
  if (result.matchedCount !== 1) throw new Error('No existe una cuenta con ese correo. Regístrala primero.');
  console.log(`La cuenta ${email} ahora tiene rol de administrador.`);
}

run()
  .catch(error => { console.error(error.message); process.exitCode = 1; })
  .finally(closeDB);
