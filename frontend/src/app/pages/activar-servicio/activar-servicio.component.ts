// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-activar-servicio',
//   standalone: true,
//   templateUrl: './activar-servicio.component.html',
//   styleUrls: ['./activar-servicio.component.css'], // o .scss si lo prefieres
//   imports: [CommonModule, FormsModule]
// })
// export class ActivarServicioComponent {
//   clave = '';
//   mensaje = '';
//   cargando = false;

//   // Íconos animados
//   iconos: IconoAnimado[] = [];

//   constructor(
//     private http: HttpClient,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     const clases = [
//       'fa-camera',
//       'fa-eye',
//       'fa-lock',
//       'fa-video',
//       'fa-key',
//       'fa-shield-alt'
//     ];
//     for (let i = 0; i < 40; i++) {
//       this.iconos.push({
//         class: clases[Math.floor(Math.random() * clases.length)],
//         left: Math.random() * 100,
//         duration: 6 + Math.random() * 6,
//         delay: Math.random() * 5,
//         size: 16 + Math.random() * 20
//       });
//     }
//   }

//   activar() {
//     if (!this.clave.trim()) {
//       this.mensaje = 'Por favor ingresa tu clave de activación.';
//       return;
//     }

//     this.mensaje = '';
//     this.cargando = true;

//     this.http.post<any>('http://localhost:3000/api/usuarios/activar', {
//       username: this.obtenerUsuario(),
//       clave: this.clave.trim()
//     }).subscribe({
//       next: res => {
//         this.mensaje = '✅ Servicio activado correctamente. Redirigiendo...';
//         setTimeout(() => {
//           this.router.navigate(['/panel-usuario']);
//         }, 1500);
//       },
//       error: err => {
//         console.error(err);
//         this.mensaje = err.error?.message || '❌ Error al activar el servicio.';
//       }
//     }).add(() => {
//       this.cargando = false;
//     });
//   }

//   obtenerUsuario(): string {
//     const token = localStorage.getItem('auth_token');
//     if (!token) return '';
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     return payload.username;
//   }

//   irAlInicio() {
//   this.router.navigate(['/']);
// }

// }

// /* ------- Interfaz íconos ------- */
// interface IconoAnimado {
//   class: string;
//   left: number;
//   duration: number;
//   delay: number;
//   size: number;
// }



// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-activar-servicio',
//   standalone: true,
//   templateUrl: './activar-servicio.component.html',
//   styleUrls: ['./activar-servicio.component.css'],
//   imports: [CommonModule, FormsModule]
// })
// export class ActivarServicioComponent {
//   clave = '';
//   mensaje = '';
//   cargando = false;

//   // Íconos animados
//   iconos: IconoAnimado[] = [];

//   constructor(
//     private http: HttpClient,
//     private router: Router,
//     private authService: AuthService
//   ) {}

//   ngOnInit(): void {
//     const clases = [
//       'fa-camera',
//       'fa-eye',
//       'fa-lock',
//       'fa-video',
//       'fa-key',
//       'fa-shield-alt'
//     ];
//     for (let i = 0; i < 40; i++) {
//       this.iconos.push({
//         class: clases[Math.floor(Math.random() * clases.length)],
//         left: Math.random() * 100,
//         duration: 6 + Math.random() * 6,
//         delay: Math.random() * 5,
//         size: 16 + Math.random() * 20
//       });
//     }
//   }

//   activar() {
//     if (!this.clave.trim()) {
//       this.mensaje = 'Por favor ingresa tu clave de activación.';
//       return;
//     }

//     this.mensaje = '';
//     this.cargando = true;

//     const token = this.authService.obtenerToken();
//     if (!token) {
//       this.mensaje = 'Sesión no válida. Por favor inicia sesión de nuevo.';
//       this.cargando = false;
//       return;
//     }

//     const headers = new HttpHeaders({
//       Authorization: `Bearer ${token}`
//     });

//     this.http.post<any>(
//       'http://localhost:3000/api/usuarios/activar',
//       { clave: this.clave.trim() },
//       { headers }
//     )
//     .subscribe({
//       next: res => {
//         this.mensaje = '✅ Servicio activado correctamente. Redirigiendo...';
//         setTimeout(() => {
//           this.router.navigate(['/panel-usuario']);
//         }, 1500);
//       },
//       error: err => {
//         console.error(err);
//         this.mensaje = err.error?.message || '❌ Error al activar el servicio.';
//       }
//     })
//     .add(() => {
//       this.cargando = false;
//     });
//   }

//   irAlInicio() {
//     this.router.navigate(['/']);
//   }
// }

// /* ------- Interfaz íconos ------- */
// interface IconoAnimado {
//   class: string;
//   left: number;
//   duration: number;
//   delay: number;
//   size: number;
// }


import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-activar-servicio',
  standalone: true,
  templateUrl: './activar-servicio.component.html',
  styleUrls: ['./activar-servicio.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ActivarServicioComponent {
  clave = '';
  mensaje = '';
  cargando = false;

  iconos: IconoAnimado[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

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

  activar(): void {
    if (!this.clave.trim()) {
      this.mensaje = 'Por favor ingresa tu clave de activación.';
      return;
    }

    this.mensaje = '';
    this.cargando = true;

    const token = this.authService.obtenerToken();
    if (!token) {
      this.mensaje = 'Sesión no válida. Por favor inicia sesión de nuevo.';
      this.cargando = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http
      .post<any>(
        'http://localhost:3000/api/usuarios/activar',
        { clave: this.clave.trim() },
        { headers }
      )
      .subscribe({
        next: (res) => {
          this.mensaje = '✅ Servicio activado correctamente. Redirigiendo...';
          setTimeout(() => {
            this.router.navigate(['/panel-usuario']);
          }, 1500);
        },
        error: (err) => {
          console.error('❌ Error al activar el servicio:', err);
          this.mensaje = err.error?.message || '❌ Error al activar el servicio.';
        }
      })
      .add(() => {
        this.cargando = false;
      });
  }

  irAlInicio(): void {
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
