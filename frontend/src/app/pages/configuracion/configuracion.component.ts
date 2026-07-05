import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {
  estado2FA: boolean = false;
  cargando: boolean = true;
  qrImage: string | null = null;
  error: string = '';
  codigoVerificacion: string = '';
  isVerifying: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.verEstado2FA();
  }

  private obtenerHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  verEstado2FA(): void {
    this.cargando = true;
    this.error = '';
    this.http.get<{ enabled: boolean }>('http://localhost:3000/2fa/status', {
      headers: this.obtenerHeaders()
    }).subscribe({
      next: res => {
        this.estado2FA = res.enabled;
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al obtener el estado de 2FA.';
        this.cargando = false;
      }
    });
  }

  activar2FA(): void {
    this.error = '';
    this.codigoVerificacion = '';
    this.qrImage = null;
    this.http.post<{ qr: string }>('http://localhost:3000/2fa/activate', {}, {
      headers: this.obtenerHeaders()
    }).subscribe({
      next: res => {
        this.qrImage = res.qr;
        this.estado2FA = false; // Aún no confirmado
      },
      error: () => {
        this.error = 'Error al activar 2FA.';
      }
    });
  }

  confirmarCodigo(): void {
    if (!this.codigoVerificacion || this.codigoVerificacion.length !== 6) {
      this.error = 'Por favor introduce el código de 6 dígitos.';
      return;
    }

    this.isVerifying = true;
    this.error = '';

    // ✅ Aquí la diferencia clave: /2fa/confirm
    this.http.post('http://localhost:3000/2fa/confirm', {
      token: this.codigoVerificacion
    }, {
      headers: this.obtenerHeaders()
    }).subscribe({
      next: () => {
        this.estado2FA = true;
        this.qrImage = null;
        this.codigoVerificacion = '';
        this.isVerifying = false;
      },
      error: () => {
        this.error = 'Código inválido o expirado.';
        this.isVerifying = false;
      }
    });
  }

  desactivar2FA(): void {
    this.error = '';
    this.http.post('http://localhost:3000/2fa/deactivate', {}, {
      headers: this.obtenerHeaders()
    }).subscribe({
      next: () => {
        this.qrImage = null;
        this.estado2FA = false;
        this.codigoVerificacion = '';
      },
      error: () => {
        this.error = 'Error al desactivar 2FA.';
      }
    });
  }
}
