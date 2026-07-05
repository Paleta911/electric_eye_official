import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { VistaCamaraComponent } from './vista-camara.component';

describe('VistaCamaraComponent', () => {
  let component: VistaCamaraComponent;
  let fixture: ComponentFixture<VistaCamaraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaCamaraComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaCamaraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
