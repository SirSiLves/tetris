import {Injectable} from '@angular/core';
import {TetrominoInterface} from "../entity/tetromino.interface";

@Injectable({
  providedIn: 'root'
})
export class RotateService {

  constructor() {
  }

  rotate(nextTetromino: TetrominoInterface, event: KeyboardEvent): void {



    console.table(nextTetromino.shape);

    const flatShapeArray = Object.keys(nextTetromino.shape)
      .reduce((arr, key) => (arr.concat(nextTetromino.shape[key])), []);

    nextTetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        const index = this.getRotateValue(1, y, x);
        nextTetromino.shape[y][x] = flatShapeArray[index];
      });
    });

    // nextTetromino.shape.forEach(r => r.reverse());

    console.table(nextTetromino.shape);

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
