import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { API_ENDPOINTS } from '../../core/config/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-resgistro',
  standalone: true,
  templateUrl: './resgistro.component.html',
  styleUrls: ['./resgistro.component.css'],
  imports: [FormsModule, CommonModule, RouterModule]
})
export class ResgistroComponent implements OnInit {
  form = { email: '', phone: '', password: '', confirmPassword: '' };
  mensaje = '';
  cargando = false;
  mostrarClave = false;
  iconos: IconoAnimado[] = [];

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.iconos = createBackgroundIcons();
  }

  registrar(): void {
    if (this.cargando) return;
    this.mensaje = this.validateForm();
    if (this.mensaje) return;

    this.cargando = true;
    const { confirmPassword: _confirmPassword, ...payload } = this.form;
    this.http.post<{ token: string; role: 'user' }>(API_ENDPOINTS.register, payload).subscribe({
      next: response => {
        this.auth.guardarSesion(response.token, response.role);
        void this.router.navigate(['/activar-servicio'], {
          state: { notice: 'Cuenta creada. Solicita tu clave de activación al administrador.' }
        });
      },
      error: error => this.handleError(error)
    });
  }

  private validateForm(): string {
    const email = this.form.email.trim();
    const phone = this.form.phone.replace(/[\s()+.-]/g, '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Introduce un correo electrónico válido.';
    if (!/^\d{7,15}$/.test(phone)) return 'Introduce un teléfono de 7 a 15 dígitos.';
    if (this.form.password.length < 10 || !/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(this.form.password) || !/\d/.test(this.form.password)) {
      return 'La contraseña debe tener al menos 10 caracteres, una letra y un número.';
    }
    if (this.form.password !== this.form.confirmPassword) return 'Las contraseñas no coinciden.';
    this.form.email = email;
    this.form.phone = phone;
    return '';
  }

  private handleError(error: HttpErrorResponse): void {
    this.cargando = false;
    this.mensaje = typeof error.error?.message === 'string' ? error.error.message : 'No se pudo crear la cuenta.';
  }
}

interface IconoAnimado { class: string; left: number; duration: number; delay: number; size: number }
function createBackgroundIcons(): IconoAnimado[] {
  const classes = ['fa-camera', 'fa-eye', 'fa-lock', 'fa-video', 'fa-key', 'fa-shield-alt'];
  return Array.from({ length: 24 }, (_, index) => ({
    class: classes[index % classes.length], left: (index * 37) % 100,
    duration: 9 + (index % 5), delay: -(index % 8), size: 16 + (index % 4) * 4
  }));
}
