import { TestBed } from '@angular/core/testing';

import { TetrominoService } from './tetromino.service';

describe('TetrominoService', () => {
  let service: TetrominoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TetrominoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
