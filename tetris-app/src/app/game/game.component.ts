import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {TetrominoService} from '../services/tetromino.service';
import {TetrominoInterface} from '../entity/tetromino.interface';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('canvasBoard') public canvas: ElementRef;
  private draw$: EventEmitter<null> = new EventEmitter();
  private destroy$ = new Subject();

  private readonly WIDTH = 10;
  private readonly HEIGHT = 15;
  private readonly BLOCK = 50;

  score = 0;
  gameOver = false;
  private sleep = 100;
  private fps = 0;
  private ctx: CanvasRenderingContext2D;
  private matrix: number[][];
  private isRunning: boolean;
  private nextTetromino: TetrominoInterface;

  private static sleeper(ms): void {
    const start = new Date().getTime();
    let end = start;
    while (end < start + ms) {
      end = new Date().getTime();
    }
  }

  constructor(
    private tetrominoService: TetrominoService
  ) {
  }

  ngOnInit(): void {
    this.matrix = Array.from({length: this.HEIGHT},
      () => new Array(this.WIDTH).fill(0));

    this.draw$.pipe(takeUntil(this.destroy$)).subscribe(() => this.drawBoard());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      if (this.fps > this.sleep || this.fps === 0) {
        this.handleTetromino();
        this.fps = 0;
      }
      requestAnimationFrame(this.render.bind(this));
      this.draw$.emit();
    }
    this.fps++;
  }

  private handleTetromino(): void {
    if (!this.nextTetromino) {
      this.nextTetromino = this.tetrominoService.generateTetromino();
      this.matrix = this.tetrominoService.updateMatrix(this.matrix, this.nextTetromino, false);
      this.sleep -= this.sleep > 0 ? 1 : 0;
    } else {
      this.doAction('ArrowDown');
    }
  }

  private drawBoard(): void {
    this.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        this.ctx.fillStyle = this.tetrominoService.getColor(value);
        this.ctx.fillRect(x * this.BLOCK, y * this.BLOCK, this.BLOCK, this.BLOCK);
      });
    });
  }

  private validateScore(): void {
    let scoreCount = 0;
    const copyMatrix: number[][] = JSON.parse(JSON.stringify(this.matrix));

    this.matrix.forEach((row, y) => {
      const tempFiltered = row.filter(v => v > 0 && v < 8);
      if (tempFiltered.length === 10) {
        copyMatrix[y].forEach((value, x) => copyMatrix[y][x] = 8);
        scoreCount += 1;
      }
    });
    this.draw$.emit();

    // count filled line and replace it from matrix with an empty array
    copyMatrix.forEach((row, y) => {
      const tempFiltered = row.filter(v => v === 8);
      if (tempFiltered.length === 10) {
        copyMatrix.splice(y, 1);
        const newArray = Array(10).fill(0);
        copyMatrix.unshift(newArray);
        // scoreCount += 1;
      }
    });

    if (scoreCount > 0) {
      this.score += Math.pow(5, scoreCount);
      this.matrix = copyMatrix;
    }
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

  private doAction(action: string): void {
    const copyTetremino = JSON.parse(JSON.stringify(this.nextTetromino));
    let copyMatrix = JSON.parse(JSON.stringify(this.matrix));

    copyMatrix = this.tetrominoService.updateMatrix(copyMatrix, copyTetremino, true);

    switch (action) {
      case 'ArrowUp':
        this.tetrominoService.rotate(copyMatrix, copyTetremino, 1);
        break;
      case 'ArrowDown':
        copyTetremino.y += 1;
        break;
      case 'ArrowRight':
        copyTetremino.x += 1;
        break;
      case 'ArrowLeft':
        copyTetremino.x += -1;
        break;
    }

    if (!this.tetrominoService.hasCollided(copyMatrix, copyTetremino)) {
      this.nextTetromino = copyTetremino;
      this.matrix = this.tetrominoService.updateMatrix(copyMatrix, copyTetremino, false);
      this.score += action === 'ArrowDown' ? 1 : 0;
    } else {
      if (action === 'ArrowDown') {
        this.validateScore();
        this.nextTetromino = null;
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  private keyEvent(event: KeyboardEvent): void {
    if (this.isRunning && this.nextTetromino) {
      this.doAction(event.key);
    }
  }

  private async markupScore(y: number): Promise<void> {
    // TODO
    this.matrix[y].forEach((v, x) => {
      this.matrix[y][x] = 8;
    });
    this.draw$.emit();

    await new Promise(resolve => setTimeout(resolve, 3000));
  }


}
