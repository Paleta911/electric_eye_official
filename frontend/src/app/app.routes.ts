import { Routes } from '@angular/router';

// 🟢 Páginas
import { InicioComponent } from './pages/landing/inicio/inicio.component';
import { AboutComponent } from './pages/landing/about/about.component';
import { ContactComponent } from './pages/landing/contact/contact.component';
import { FeaturesComponent } from './pages/landing/features/features.component';
import { ServicesComponent } from './pages/landing/services/services.component';
import { TestimonialsComponent } from './pages/landing/testimonials/testimonials.component';
import { KeyComponent } from './pages/auth/key/key.component';
import { MisCamarasComponent } from './pages/mis-camaras/mis-camaras.component';
import { ListaAsistenciaComponent } from './pages/lista-asistencia/lista-asistencia.component';
import { AnomaliasComponent } from './pages/anomalias/anomalias.component';
import { GrabacionesComponent } from './pages/grabaciones/grabaciones.component';
import { VistaCamaraComponent } from './pages/vista-camara/vista-camara.component';
import { ConfiguracionComponent } from './pages/configuracion/configuracion.component';
import { AuthLayoutComponent }    from './layouts/auth-layout/auth-layout.component';


// 🛡️ Guards
import { RoleGuard } from './guards/role.guard';
import { AuthGuard } from './guards/auth.guard'; // Asegúrate de tener este guard creado


// 🧩 Layouts
import { LandingLayoutComponent } from './layouts/landing-layout/landing-layout.component';
import { MenuamburguesaLayoutComponent } from './layouts/menuamburguesa-layout/menuamburguesa-layout.component';


export const routes: Routes = [
  // —————— Rutas de auth sin navbar ——————
  {
    path: 'login-clave',
    component: AuthLayoutComponent,
    children: [
      { path: '', component: KeyComponent }
    ]
  },
  {
    path: 'registro',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/registro/resgistro.component')
            .then(m => m.ResgistroComponent)
      }
    ]
  },

  // —————— Landing con navbar ——————
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      // Home en '/' y también atender '/inicio'
      { path: '',      component: InicioComponent,     pathMatch: 'full' },
      { path: 'inicio',redirectTo: '',                 pathMatch: 'full' },

      { path: 'about',        component: AboutComponent },
      { path: 'contact',      component: ContactComponent },
      { path: 'features',     component: FeaturesComponent },
      { path: 'services',     component: ServicesComponent },
      { path: 'testimonials', component: TestimonialsComponent },
      {
        path: 'activar-servicio',
        loadComponent: () =>
          import('./pages/activar-servicio/activar-servicio.component')
            .then(m => m.ActivarServicioComponent)
      }
    ]
  },

  // —————— Panel de usuario ——————
  {
    path: 'panel-usuario',
    canActivate: [AuthGuard, RoleGuard],
    component: MenuamburguesaLayoutComponent,
    children: [
      { path: '', redirectTo: 'mis-camaras', pathMatch: 'full' },
      { path: 'mis-camaras',     component: MisCamarasComponent },
      { path: 'lista-asistencia',component: ListaAsistenciaComponent },
      { path: 'anomalias',       component: AnomaliasComponent },
      { path: 'grabaciones',     component: GrabacionesComponent },
      { path: 'camara/:id',      component: VistaCamaraComponent },
      { path: 'configuracion',   component: ConfiguracionComponent }
    ]
  },

  // —————— Panel de admin ——————
  {
    path: 'panel-admin',
    canActivate: [AuthGuard,RoleGuard],
    component: MenuamburguesaLayoutComponent,
    children: [
      { path: '', component: ConfiguracionComponent }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
