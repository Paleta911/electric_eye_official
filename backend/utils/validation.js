const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d{7,15}$/;

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizePhone(value) {
  return typeof value === 'string' ? value.replace(/[\s()+.-]/g, '') : '';
}

function isValidEmail(value) {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

function isValidPhone(value) {
  return PHONE_PATTERN.test(value);
}

function passwordValidationMessage(value) {
  if (typeof value !== 'string' || value.length < 10 || value.length > 128) {
    return 'La contraseña debe tener entre 10 y 128 caracteres.';
  }
  if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(value) || !/\d/.test(value)) {
    return 'La contraseña debe incluir al menos una letra y un número.';
  }
  return null;
}

function cleanText(value, maxLength = 100) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, maxLength);
}

function isIsoTimestamp(value) {
  return typeof value === 'string'
    && value.length <= 40
    && !Number.isNaN(Date.parse(value));
}

module.exports = {
  cleanText,
  isIsoTimestamp,
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
  passwordValidationMessage
};
