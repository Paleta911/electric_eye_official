import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PanelAdministrativoComponent } from './panel-administrativo.component';

describe('PanelAdministrativoComponent', () => {
  let component: PanelAdministrativoComponent;
  let fixture: ComponentFixture<PanelAdministrativoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelAdministrativoComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelAdministrativoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
