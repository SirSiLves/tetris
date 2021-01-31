import { TestBed } from '@angular/core/testing';

import { RotateService } from './rotate.service';

describe('RotateService', () => {
  let service: RotateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RotateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
