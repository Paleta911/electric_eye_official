const test = require('node:test');
const assert = require('node:assert/strict');
const {
  cleanText,
  isIsoTimestamp,
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
  passwordValidationMessage
} = require('../utils/validation');

test('normaliza correo y teléfono antes de almacenarlos', () => {
  assert.equal(normalizeEmail('  User@Example.COM '), 'user@example.com');
  assert.equal(normalizePhone('+52 (55) 1234-5678'), '525512345678');
});

test('rechaza formatos de identidad inválidos', () => {
  assert.equal(isValidEmail('usuario@example.com'), true);
  assert.equal(isValidEmail('usuario@'), false);
  assert.equal(isValidPhone('5512345678'), true);
  assert.equal(isValidPhone('55abc'), false);
});

test('exige contraseñas con longitud, letras y números', () => {
  assert.match(passwordValidationMessage('corta1'), /10/);
  assert.match(passwordValidationMessage('sololetrass'), /letra y un número/);
  assert.equal(passwordValidationMessage('ClaveSegura123'), null);
});

test('limpia controles y limita texto externo', () => {
  assert.equal(cleanText('  Alexis\u0000\n', 20), 'Alexis');
  assert.equal(cleanText('abcdefgh', 4), 'abcd');
});

test('valida timestamps procesables', () => {
  assert.equal(isIsoTimestamp('2026-07-06T12:00:00.000Z'), true);
  assert.equal(isIsoTimestamp('ayer'), false);
});
