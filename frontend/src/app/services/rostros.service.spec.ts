import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { RostrosService } from './rostros.service';

describe('RostrosService', () => {
  let service: RostrosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(RostrosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
