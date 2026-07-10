const { createApp } = require('./app');
const { config, validateConfig } = require('./config');
const { closeDB, connectDB } = require('./utils/mongo');

let server;

async function shutdown(signal) {
  console.log(`Cerrando servidor (${signal})...`);
  if (server) await new Promise(resolve => server.close(resolve));
  await closeDB();
  process.exit(0);
}

async function start() {
  validateConfig();
  await connectDB();
  const app = createApp();
  server = app.listen(config.port, config.host, () => {
    console.log(`Servidor disponible en http://localhost:${config.port}`);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch(error => {
  console.error(`No se pudo iniciar el servidor: ${error.message}`);
  process.exit(1);
});
