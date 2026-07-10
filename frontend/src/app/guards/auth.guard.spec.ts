import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { API_ENDPOINTS } from '../core/config/api';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let http: HttpTestingController;
  let router: Router;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthGuard, provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
    guard = TestBed.inject(AuthGuard);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => { http.verify(); localStorage.clear(); });

  it('redirects to login when there is no token', done => {
    guard.canActivate().subscribe(result => {
      expect(router.serializeUrl(result as UrlTree)).toBe('/login-clave');
      done();
    });
  });

  it('allows an active session and refreshes its role', done => {
    auth.guardarToken('test-token');
    guard.canActivate().subscribe(result => {
      expect(result).toBeTrue();
      expect(auth.obtenerRol()).toBe('user');
      done();
    });
    http.expectOne(API_ENDPOINTS.verifySession).flush({ role: 'user', servicioActivo: true });
  });

  it('sends inactive accounts to activation', done => {
    auth.guardarToken('test-token');
    guard.canActivate().subscribe(result => {
      expect(router.serializeUrl(result as UrlTree)).toBe('/activar-servicio');
      done();
    });
    http.expectOne(API_ENDPOINTS.verifySession).flush({ role: 'user', servicioActivo: false });
  });

  it('clears an invalid session and redirects to login', done => {
    auth.guardarSesion('test-token', 'user');
    guard.canActivate().subscribe(result => {
      expect(router.serializeUrl(result as UrlTree)).toBe('/login-clave?sesion=expirada');
      expect(auth.estaAutenticado()).toBeFalse();
      done();
    });
    http.expectOne(API_ENDPOINTS.verifySession).flush({}, { status: 401, statusText: 'Unauthorized' });
  });
});
