import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {RotateService} from "../services/rotate.service";
import {TetrominoService} from "../services/tetromino.service";
import {TetrominoInterface} from "../entity/tetromino.interface";



@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewInit {

  @ViewChild('canvasBoard') public canvas: ElementRef;

  private WIDTH = 10;
  private HEIGHT = 15;
  private BLOCK = 50;
  private SLEEP = 100;

  private ctx: CanvasRenderingContext2D;
  private matrix: number[][];
  private isRunning: boolean;
  private fps: number;
  private nextTetromino: TetrominoInterface;
  private isGameOver: boolean;

  constructor(
    private rotateService: RotateService,
    private tetrominoService: TetrominoService
  ) {
  }

  ngOnInit(): void {
    this.matrix = Array.from({length: this.HEIGHT},
      () => new Array(this.WIDTH).fill(0));

    this.isGameOver = false;

    // TODO initialize
    this.matrix[0][0] = 2;
    this.matrix[12][5] = 4;
    this.matrix[this.HEIGHT - 1][this.WIDTH - 1] = 7;
  }

  public ngAfterViewInit(): void {
    this.buildFrame();
  }

  private buildFrame(): void {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.ctx = canvasEl.getContext('2d');

    canvasEl.width = this.WIDTH * this.BLOCK;
    canvasEl.height = this.HEIGHT * this.BLOCK;
  }

  private render(): void {
    if (this.isRunning) {

      if (!this.fps || this.fps > this.SLEEP || this.fps === 0) {
        this.clear();
        this.handleTetromino();
        this.drawBoard();
        this.fps = 0;

        // console.table(this.matrix);
      }
      requestAnimationFrame(this.render.bind(this));

    }
    this.fps++;
  }

  private handleTetromino(): void {
    if (!this.nextTetromino || this.tetrominoService.hasCollided(this.matrix, this.nextTetromino)) {
      this.nextTetromino = this.tetrominoService.generateTetromino();
    } else {
      // reset tetromino in matrix
      this.tetrominoService.refreshMatrix(this.matrix, this.nextTetromino, true);

      // force tetromino down
      this.nextTetromino.y += 1;
    }

    // set current tetromino to matrix
    this.tetrominoService.refreshMatrix(this.matrix, this.nextTetromino, false);
  }

  private drawBoard(): void {
    // retrieve value from matrix and draw rectangle in mapped color
    this.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        this.ctx.fillStyle = this.tetrominoService.getColor(value);
        this.ctx.fillRect(x * this.BLOCK, y * this.BLOCK, this.BLOCK, this.BLOCK);
      });
    });
  }

  go(): void {
    this.isRunning = true;
    this.render();
  }

  stop(): void {
    this.isRunning = false;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  @HostListener('window:keydown', ['$event'])
  private keyEvent(event: KeyboardEvent): void {
    if (this.isRunning && event.key === 'ArrowUp') {
      this.rotateService.rotate(this.nextTetromino, event);
      this.tetrominoService.refreshMatrix(this.matrix, this.nextTetromino, false);
    }

  }
}
