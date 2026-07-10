import { Injectable } from '@angular/core';

export type UserRole = 'user' | 'admin';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly roleKey = 'user_role';

  guardarSesion(token: string, role: UserRole): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.roleKey, role);
  }

  guardarToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  obtenerRol(): UserRole | null {
    const role = localStorage.getItem(this.roleKey);
    return role === 'admin' || role === 'user' ? role : null;
  }

  eliminarToken(): void {
    this.eliminarSesion();
  }

  eliminarSesion(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
  }

  estaAutenticado(): boolean {
    return Boolean(this.obtenerToken());
  }
}
