import {Injectable} from '@angular/core';
import {TetrominoInterface} from '../entity/tetromino.interface';

@Injectable({
  providedIn: 'root'
})
export class TetrominoService {

  private readonly COLOR_TABLE = {
    0: '#FFFFFF',
    1: '#32CD32',
    2: '#FF0000',
    3: '#008B8B',
    4: '#FF00FF',
    5: '#2F4F4F',
    6: '#00008B',
    7: '#FFA500',
    8: '#32FF00', // Scorer color
    9: '#F7FF00'  // Scorer color
  };
  private readonly TETROMINO_SHAPE: TetrominoInterface[] = [
    {
      x: 3, y: 0, type: 1, color: this.COLOR_TABLE[1],
      shape: [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
      ]
    },
    {
      x: 3, y: 0, type: 2, color: this.COLOR_TABLE[2],
      shape: [
        [0, 2, 2, 0],
        [0, 2, 0, 0],
        [0, 2, 0, 0],
        [0, 0, 0, 0]
      ]
    },
    {
      x: 3, y: -1, type: 3, color: this.COLOR_TABLE[3],
      shape: [
        [0, 0, 0, 0],
        [0, 3, 3, 0],
        [0, 3, 3, 0],
        [0, 0, 0, 0]
      ]
    },
    {
      x: 3, y: 0, type: 4, color: this.COLOR_TABLE[4],
      shape: [
        [0, 4, 0, 0],
        [0, 4, 4, 0],
        [0, 0, 4, 0],
        [0, 0, 0, 0]
      ]
    },
    {
      x: 3, y: 0, type: 5, color: this.COLOR_TABLE[5],
      shape: [
        [0, 5, 0, 0],
        [0, 5, 5, 0],
        [0, 5, 0, 0],
        [0, 0, 0, 0]
      ]
    },
    {
      x: 3, y: 0, type: 6, color: this.COLOR_TABLE[6],
      shape: [
        [0, 0, 6, 0],
        [0, 6, 6, 0],
        [0, 6, 0, 0],
        [0, 0, 0, 0]
      ]
    },
    {
      x: 3, y: 0, type: 7, color: this.COLOR_TABLE[7],
      shape: [
        [0, 7, 7, 0],
        [0, 0, 7, 0],
        [0, 0, 7, 0],
        [0, 0, 0, 0]
      ]
    },
  ];

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
    const rndNmb = Math.floor(Math.random() * Math.floor(7));
    return JSON.parse(JSON.stringify(this.TETROMINO_SHAPE[rndNmb]));
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
