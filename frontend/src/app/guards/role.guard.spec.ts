import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, provideRouter } from '@angular/router';

import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let router: Router;
  let navigateSpy: jasmine.Spy;

  const route = {} as ActivatedRouteSnapshot;
  const state = (url: string) => ({ url } as RouterStateSnapshot);

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [RoleGuard, provideRouter([])]
    });

    guard = TestBed.inject(RoleGuard);
    router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    spyOn(console, 'log');
    spyOn(console, 'warn');
  });

  afterEach(() => localStorage.clear());

  it('rejects unauthenticated users', () => {
    expect(guard.canActivate(route, state('/panel-usuario'))).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('allows an admin to enter the admin panel', () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('user_role', 'admin');

    expect(guard.canActivate(route, state('/panel-admin'))).toBeTrue();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('rejects a non-admin user from the admin panel', () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('user_role', 'user');

    expect(guard.canActivate(route, state('/panel-admin'))).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('allows a user to enter the user panel', () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('user_role', 'user');

    expect(guard.canActivate(route, state('/panel-usuario'))).toBeTrue();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('rejects an admin from the user panel', () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('user_role', 'admin');

    expect(guard.canActivate(route, state('/panel-usuario'))).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});
