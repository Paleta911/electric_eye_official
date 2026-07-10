import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_ENDPOINTS } from '../../core/config/api';
import { ResgistroComponent } from './resgistro.component';

describe('ResgistroComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [ResgistroComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
  });

  it('registers without requesting an activation key', () => {
    const fixture = TestBed.createComponent(ResgistroComponent);
    const component = fixture.componentInstance;
    const http = TestBed.inject(HttpTestingController);
    component.form = {
      email: 'test@example.com', phone: '5512345678',
      password: 'ClaveSegura123', confirmPassword: 'ClaveSegura123'
    };

    component.registrar();
    http.expectOne(API_ENDPOINTS.register).flush({ token: 'token', role: 'user' });
    http.verify();
  });
});
