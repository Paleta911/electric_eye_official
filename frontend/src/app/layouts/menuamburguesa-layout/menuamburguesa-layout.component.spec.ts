import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MenuamburguesaLayoutComponent } from './menuamburguesa-layout.component';

describe('MenuamburguesaLayoutComponent', () => {
  let component: MenuamburguesaLayoutComponent;
  let fixture: ComponentFixture<MenuamburguesaLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuamburguesaLayoutComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuamburguesaLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
