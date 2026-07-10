import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { API_ENDPOINTS } from '../../../core/config/api';
import { AuthService, UserRole } from '../../../services/auth.service';

type LoginResponse = {
  token?: string;
  role?: UserRole;
  servicioActivo?: boolean;
  twofa_required?: boolean;
  tempToken?: string;
};

@Component({
  selector: 'app-key',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './key.component.html',
  styleUrl: './key.component.css'
})
export class KeyComponent implements OnInit {
  identificador = '';
  password = '';
  tokenInput = '';
  tempToken: string | null = null;
  show2FA = false;
  mostrarClave = false;
  showContactMessage = false;
  errorMessage = '';
  cargando = false;
  iconos: IconoAnimado[] = [];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('sesion') === 'expirada') {
      this.errorMessage = 'Tu sesión expiró. Inicia sesión nuevamente.';
    }
    this.iconos = createBackgroundIcons();
  }

  validateCredentialsWithBackend(): void {
    if (this.cargando) return;
    this.errorMessage = '';
    this.showContactMessage = false;

    const identifier = this.identificador.trim();
    const payload: { password: string; email?: string; phone?: string } = { password: this.password };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) payload.email = identifier;
    else if (/^\d{7,15}$/.test(identifier)) payload.phone = identifier;
    else {
      this.errorMessage = 'Introduce un correo válido o un teléfono de 7 a 15 dígitos.';
      return;
    }
    if (!this.password) {
      this.errorMessage = 'Introduce tu contraseña.';
      return;
    }

    this.cargando = true;
    this.http.post<LoginResponse>(API_ENDPOINTS.login, payload).subscribe({
      next: response => {
        this.cargando = false;
        if (response.twofa_required && response.tempToken) {
          this.tempToken = response.tempToken;
          this.show2FA = true;
          this.password = '';
          return;
        }
        this.completeLogin(response);
      },
      error: error => this.handleError(error, 'No se pudo iniciar sesión.')
    });
  }

  verify2FA(): void {
    if (this.cargando || !this.tempToken) return;
    if (!/^\d{6}$/.test(this.tokenInput.trim())) {
      this.errorMessage = 'Introduce el código de seis dígitos.';
      return;
    }

    this.cargando = true;
    this.errorMessage = '';
    this.http.post<LoginResponse>(API_ENDPOINTS.verify2FA, {
      tempToken: this.tempToken,
      token: this.tokenInput.trim()
    }).subscribe({
      next: response => {
        this.cargando = false;
        this.completeLogin(response);
      },
      error: error => this.handleError(error, 'No se pudo verificar el código.')
    });
  }

  volverACredenciales(): void {
    this.show2FA = false;
    this.tempToken = null;
    this.tokenInput = '';
    this.errorMessage = '';
  }

  forgotKey(): void {
    this.showContactMessage = true;
    this.errorMessage = '';
  }

  private completeLogin(response: LoginResponse): void {
    if (!response.token || (response.role !== 'user' && response.role !== 'admin')) {
      this.errorMessage = 'El servidor devolvió una sesión incompleta.';
      return;
    }
    this.auth.guardarSesion(response.token, response.role);
    if (!response.servicioActivo) {
      void this.router.navigate(['/activar-servicio']);
      return;
    }
    void this.router.navigate([response.role === 'admin' ? '/panel-admin' : '/panel-usuario']);
  }

  private handleError(error: HttpErrorResponse, fallback: string): void {
    this.cargando = false;
    this.errorMessage = typeof error.error?.message === 'string' ? error.error.message : fallback;
  }
}

interface IconoAnimado { class: string; left: number; duration: number; delay: number; size: number }

function createBackgroundIcons(): IconoAnimado[] {
  const classes = ['fa-camera', 'fa-eye', 'fa-lock', 'fa-video', 'fa-key', 'fa-shield-alt'];
  return Array.from({ length: 24 }, (_, index) => ({
    class: classes[index % classes.length],
    left: (index * 37) % 100,
    duration: 9 + (index % 5),
    delay: -(index % 8),
    size: 16 + (index % 4) * 4
  }));
}
