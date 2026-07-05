import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    guard = TestBed.inject(AuthGuard);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('redirects to the landing page when there is no token', (done) => {
    guard.canActivate().subscribe((result) => {
      expect(result instanceof UrlTree).toBeTrue();
      expect(router.serializeUrl(result as UrlTree)).toBe('/');
      done();
    });
  });

  it('allows access when the service is active', (done) => {
    localStorage.setItem('auth_token', 'test-token');

    guard.canActivate().subscribe((result) => {
      expect(result).toBeTrue();
      done();
    });

    const request = httpTesting.expectOne('http://localhost:3000/api/usuarios/verificar-sesion');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush({ servicioActivo: true });
  });

  it('redirects when the service is inactive', (done) => {
    localStorage.setItem('auth_token', 'test-token');

    guard.canActivate().subscribe((result) => {
      expect(result instanceof UrlTree).toBeTrue();
      expect(router.serializeUrl(result as UrlTree)).toBe('/');
      done();
    });

    httpTesting.expectOne('http://localhost:3000/api/usuarios/verificar-sesion')
      .flush({ servicioActivo: false });
  });

  it('redirects when session validation fails', (done) => {
    localStorage.setItem('auth_token', 'test-token');

    guard.canActivate().subscribe((result) => {
      expect(result instanceof UrlTree).toBeTrue();
      expect(router.serializeUrl(result as UrlTree)).toBe('/');
      done();
    });

    httpTesting.expectOne('http://localhost:3000/api/usuarios/verificar-sesion')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});
