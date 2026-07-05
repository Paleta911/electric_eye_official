import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnomaliasComponent } from './anomalias.component';

describe('AnomaliasComponent', () => {
  let component: AnomaliasComponent;
  let fixture: ComponentFixture<AnomaliasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnomaliasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnomaliasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
