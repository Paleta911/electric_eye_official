const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../app');

async function withServer(run) {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('las operaciones privilegiadas rechazan solicitudes anónimas', async () => {
  await withServer(async baseUrl => {
    for (const [path, method] of [
      ['/api/usuarios/claves-activacion', 'POST'],
      ['/api/usuarios/administrados', 'POST'],
      ['/snapshot/1', 'GET'],
      ['/imagen/507f1f77bcf86cd799439011', 'GET']
    ]) {
      const response = await fetch(`${baseUrl}${path}`, { method });
      assert.equal(response.status, 401, path);
    }
  });
});

test('la integración de IA exige su credencial dedicada', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/api/rostros`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nombre: 'Prueba', estado: 'Presente', timestamp: new Date().toISOString() })
    });
    assert.equal(response.status, 401);
  });
});

test('el registro rechaza payloads inválidos antes de acceder a datos', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/api/usuarios/registrar`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'no-es-correo', phone: 'abc', password: '123' })
    });
    assert.equal(response.status, 400);
  });
});

test('las respuestas eliminan fingerprinting y agregan cabeceras seguras', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/ruta-inexistente`);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('x-powered-by'), null);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  });
});
