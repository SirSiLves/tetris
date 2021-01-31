import {Injectable} from '@angular/core';
import {TetrominoInterface} from "../entity/tetromino.interface";

@Injectable({
  providedIn: 'root'
})
export class RotateService {

  constructor() {
  }

  rotate(nextTetromino: TetrominoInterface, event: KeyboardEvent): void {
    console.log(event);
    console.log(nextTetromino);

    const testShape1 = [
      [6, 0, 0, 0],
      [6, 6, 6, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];

    const testShape2 = [
      [0, 6, 6, 0],
      [0, 6, 0, 0],
      [0, 6, 0, 0],
      [0, 0, 0, 0]
    ];

    console.log(this.getRotateValue(1, nextTetromino.y, nextTetromino.x));

  }


  getRotateValue(r: number, py: number, px: number): number {
    switch (r % 4) {
      case 0:
        return py * 4 + px;           //  0  degrees
      case 1:
        return 12 + py - (px * 4);    // 90  degrees
      case 2:
        return 15 - (py * 4) - px;    // 180 degrees
      case 3:
        return 3 - py + (px * 4);     // 270 degrees
      default:
        return 0;
    }
  }


}
