import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { API_ENDPOINTS } from '../core/config/api';
import { AuthService } from '../services/auth.service';
import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let http: HttpTestingController;
  let router: Router;
  let auth: AuthService;
  const route = {} as ActivatedRouteSnapshot;
  const state = (url: string) => ({ url } as RouterStateSnapshot);

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [RoleGuard, provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
    guard = TestBed.inject(RoleGuard);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => { http.verify(); localStorage.clear(); });

  it('redirects anonymous users to login', done => {
    guard.canActivate(route, state('/panel-usuario')).subscribe(result => {
      expect(router.serializeUrl(result as UrlTree)).toBe('/login-clave');
      done();
    });
  });

  it('validates an administrator against the backend', done => {
    auth.guardarToken('token');
    guard.canActivate(route, state('/panel-admin')).subscribe(result => {
      expect(result).toBeTrue();
      done();
    });
    http.expectOne(API_ENDPOINTS.currentUser).flush({ role: 'admin', servicioActivo: true });
  });

  it('redirects a user away from the admin panel', done => {
    auth.guardarToken('token');
    guard.canActivate(route, state('/panel-admin')).subscribe(result => {
      expect(router.serializeUrl(result as UrlTree)).toBe('/panel-usuario');
      done();
    });
    http.expectOne(API_ENDPOINTS.currentUser).flush({ role: 'user', servicioActivo: true });
  });
});
