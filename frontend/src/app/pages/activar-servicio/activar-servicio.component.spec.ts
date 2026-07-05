import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ActivarServicioComponent } from './activar-servicio.component';

describe('ActivarServicioComponent', () => {
  let component: ActivarServicioComponent;
  let fixture: ComponentFixture<ActivarServicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivarServicioComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivarServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
