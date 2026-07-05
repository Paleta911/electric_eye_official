import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { LandingNavbarComponent } from './landing-navbar.component';

describe('LandingNavbarComponent', () => {
  let component: LandingNavbarComponent;
  let fixture: ComponentFixture<LandingNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingNavbarComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
