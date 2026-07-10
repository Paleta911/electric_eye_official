import { environment } from '../../../environments/environment';

function joinUrl(base: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base.replace(/\/$/, '')}${normalizedPath}`;
}

export const apiUrl = (path: string): string => joinUrl(environment.apiBaseUrl, path);
export const streamUrl = (path: string): string => joinUrl(environment.streamBaseUrl, path);

export const API_ENDPOINTS = Object.freeze({
  login: apiUrl('/login'),
  verify2FA: apiUrl('/2fa/verify'),
  twoFactorStatus: apiUrl('/2fa/status'),
  twoFactorActivate: apiUrl('/2fa/activate'),
  twoFactorConfirm: apiUrl('/2fa/confirm'),
  twoFactorDeactivate: apiUrl('/2fa/deactivate'),
  register: apiUrl('/api/usuarios/registrar'),
  activateAccount: apiUrl('/api/usuarios/activar'),
  currentUser: apiUrl('/api/usuarios/me'),
  verifySession: apiUrl('/api/usuarios/verificar-sesion'),
  faces: apiUrl('/api/rostros'),
  attendance: apiUrl('/asistencias')
});
