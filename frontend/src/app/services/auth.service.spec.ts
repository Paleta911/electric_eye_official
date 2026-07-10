import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('stores and clears the complete session', () => {
    service.guardarSesion('token', 'admin');
    expect(service.obtenerToken()).toBe('token');
    expect(service.obtenerRol()).toBe('admin');
    service.eliminarSesion();
    expect(service.obtenerToken()).toBeNull();
    expect(service.obtenerRol()).toBeNull();
  });
});
