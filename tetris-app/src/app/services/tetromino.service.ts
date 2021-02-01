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
          matrix[nextTetromino.y + tY][nextTetromino.x + tX] = remove ? 0 : nextTetromino.type;
        }
      });
    });
  }

  hasCollided(matrix: number[][], nextTetromino: TetrominoInterface): boolean {
    let isCollided = false;

    // this.refreshMatrix(matrix, nextTetromino, true);
    // nextTetromino.y += 1;
    //
    // nextTetromino.shape.forEach((tRow, tY) => {
    //   tRow.forEach((tValue, tX) => {
    //     if (tValue !== 0 && matrix[nextTetromino.y + tY][nextTetromino.x + tX] !== 0) {
    //       isCollided = false;
    //     }
    //   });
    // });
    //
    // nextTetromino.y -= 1;
    // this.refreshMatrix(matrix, nextTetromino, false);

    return isCollided;
  }


}
