import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-key',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './key.component.html',
  styleUrl: './key.component.css'
})
export class KeyComponent {
  /* ------- Lógica de autenticación ------- */
  attemptsLeft = 4;
  showError = false;
  errorMessage = '';
  showContactMessage = false;
  locked = false;
  mostrarClave = false;
  animacionError = false;
  desbloqueado = false;

  identificador: string = '';
  password: string = '';

  token: string | null = null;
  tempToken: string | null = null;

  tokenInput: string = '';
  show2FA: boolean = false;
  isVerifying: boolean = false;

  constructor(private router: Router, private http: HttpClient) {}

  /* ------- Íconos animados ------- */
  iconos: IconoAnimado[] = [];

  ngOnInit(): void {
    const clases = [
      'fa-camera',
      'fa-eye',
      'fa-lock',
      'fa-video',
      'fa-key',
      'fa-shield-alt'
    ];
    for (let i = 0; i < 40; i++) {
      this.iconos.push({
        class: clases[Math.floor(Math.random() * clases.length)],
        left: Math.random() * 100,
        duration: 6 + Math.random() * 6,
        delay: Math.random() * 5,
        size: 16 + Math.random() * 20
      });
    }
  }

  /* ------- Validar credenciales con backend ------- */
  validateCredentialsWithBackend(): void {
    if (this.locked) return;

    this.showError = false;
    this.errorMessage = '';

    const loginPayload: any = {
      password: this.password
    };

    const valor = this.identificador.trim();

    if (valor.includes('@')) {
      // Es correo electrónico
      loginPayload.email = valor;
    } else if (/^\d{7,15}$/.test(valor)) {
      // Es número de celular
      loginPayload.phone = valor;
    } else {
      this.errorMessage = 'Introduce un correo válido o un número de celular.';
      this.showError = true;
      return;
    }

    this.http.post<any>('http://localhost:3000/login', loginPayload).subscribe({
      next: (res) => {
        if (res.twofa_required) {
          this.tempToken = res.tempToken;
          this.show2FA = true;
        } else {
          this.token = res.token;
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('user_role', res.role);

          this.desbloqueado = true;

          setTimeout(() => {
            this.router.navigate(['/panel-usuario']);
          }, 1200);
        }
      },
      error: err => {
        this.attemptsLeft--;
        this.errorMessage = err.error?.message || 'Error de autenticación.';
        this.showError = true;
        this.animacionError = true;
        setTimeout(() => this.animacionError = false, 1000);
        if (this.attemptsLeft <= 0) {
          this.locked = true;
        }
      }
    });
  }

  /* ------- Verificar token 2FA ------- */
  verify2FA(): void {
    if (!this.tempToken || !this.tokenInput) return;

    this.isVerifying = true;
    this.showError = false;
    this.errorMessage = '';

    this.http.post<any>('http://localhost:3000/2fa/verify', {
      tempToken: this.tempToken,
      token: this.tokenInput
    }).subscribe({
      next: res => {
        this.token = res.token;

        if (!res.role) {
          console.error('❌ El backend no devolvió el rol.');
          this.isVerifying = false;
          this.errorMessage = 'Error: el servidor no devolvió el rol.';
          this.showError = true;
          return;
        }

        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('user_role', res.role);

        this.desbloqueado = true;
        this.isVerifying = false;

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1200);
      },
      error: err => {
        this.isVerifying = false;
        this.errorMessage = err.error?.message || 'Código 2FA incorrecto.';
        this.showError = true;
      }
    });
  }

  /* ------- ¿Olvidó clave? ------- */
  forgotKey(): void {
    this.showContactMessage = true;
    this.showError = false;
  }

  irAlInicio() {
    this.router.navigate(['/']);
  }
}

/* ------- Interfaz íconos ------- */
interface IconoAnimado {
  class: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
}
