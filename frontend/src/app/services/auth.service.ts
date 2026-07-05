

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Esto hace que Angular pueda inyectarlo globalmente
})
export class AuthService {
  private readonly tokenKey = 'auth_token'; // Nombre clave en localStorage

  constructor() {}

  /**
   * Guarda el token JWT en el localStorage
   * @param token El token JWT
   */
  guardarToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Recupera el token guardado en localStorage
   * @returns El token o null si no existe
   */
  obtenerToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Elimina el token del localStorage (logout)
   */
  eliminarToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Verifica si hay un token presente (sesión activa)
   * @returns true si está autenticado
   */
  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }
}
