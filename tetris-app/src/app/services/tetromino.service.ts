import {Injectable} from '@angular/core';
import {TetrominoInterface} from '../entity/tetromino.interface';

@Injectable({
  providedIn: 'root'
})
export class TetrominoService {

  private COLOR_TABLE = {
    0: '#FFFFFF',
    1: '#32CD32',
    2: '#FF0000',
    3: '#008B8B',
    4: '#FF00FF',
    5: '#2F4F4F',
    6: '#00008B',
    7: '#FFA500'
  };

  constructor() {
  }

  private static getRotateIndex(r: number, py: number, px: number): number {
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

  generateTetromino(): TetrominoInterface {
    return {
      x: 3,
      y: 0,
      type: 6,
      color: this.COLOR_TABLE[6],
      shape: [
        [0, 6, 6, 0],
        [0, 6, 0, 0],
        [0, 6, 0, 0],
        [0, 0, 0, 0]
      ]
    };
  }

  getColor(x: number): string {
    return this.COLOR_TABLE[x];
  }

  updateMatrix(matrix: number[][], nextTetromino: TetrominoInterface, remove: boolean): void {
    nextTetromino.shape.forEach((tRow, tY) => {
      tRow.forEach((tValue, tX) => {
        if (tValue !== 0) {
          try {
            matrix[nextTetromino.y + tY][nextTetromino.x + tX] = remove ? 0 : nextTetromino.type;
          } catch (e) {
          }
        }
      });
    });
  }

  hasCollided(matrix: number[][], nextTetromino: TetrominoInterface): boolean {
    let collided = false;

    nextTetromino.shape.forEach((tRow, tY) => {
      tRow.forEach((tValue, tX) => {
        try {
          if (tValue !== 0 && matrix[nextTetromino.y + tY][nextTetromino.x + tX] !== 0) {
            collided = true;
          }
        } catch (e) {
          collided = true;
        }
      });
    });

    return collided;
  }

  rotate(matrix: number[][], nextTetromino: TetrominoInterface, rotate: number): void {
    const flatShapeArray = Object.keys(nextTetromino.shape)
      .reduce((arr, key) => (arr.concat(nextTetromino.shape[key])), []);

    nextTetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        const index = TetrominoService.getRotateIndex(rotate, y, x);
        nextTetromino.shape[y][x] = flatShapeArray[index];

        if (this.hasCollided(matrix, nextTetromino)) {
          nextTetromino.x += nextTetromino.x < 0 ? 1 : -1;
        }
      });
    });
  }

}
