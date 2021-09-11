import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener, Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {TetrominoService} from '../services/tetromino.service';
import {TetrominoInterface} from '../entity/tetromino.interface';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {StateService} from '../services/state.service';
import {MatDialog} from '@angular/material/dialog';
import {GameOverDialogComponent} from './game-over-dialog/game-over-dialog.component';


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
  private readonly HEIGHT = 18;
  private readonly BLOCK = 40;

  score: number;
  clearedLines: number;
  gameOver: boolean;
  difficulty: number;
  private sleep: number;
  private fps: number;
  private ctx: CanvasRenderingContext2D;
  private matrix: number[][];
  private isRunning: boolean;
  private nextTetromino: TetrominoInterface;
  private requestAnimationId: number;

  constructor(
    private tetrominoService: TetrominoService,
    private stateService: StateService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.reset();
    this.draw$.pipe(takeUntil(this.destroy$)).subscribe(() => this.drawBoard());

    this.stateService.startEvent.pipe(takeUntil(this.destroy$)).subscribe(() => this.start());
    this.stateService.pauseEvent.pipe(takeUntil(this.destroy$)).subscribe(() => this.stop());
    this.stateService.resetEvent.pipe(takeUntil(this.destroy$)).subscribe(() => this.restart());

    // TODO TEMP
    this.openDialog();
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
      this.requestAnimationId = requestAnimationFrame(this.render.bind(this));
      this.draw$.emit();
      this.fps++;
    }
  }

  private handleTetromino(): void {
    if (!this.nextTetromino) {
      this.nextTetromino = this.tetrominoService.generateTetromino();
      const oldMatrix = JSON.parse(JSON.stringify(this.matrix));
      this.matrix = this.tetrominoService.updateMatrix(this.matrix, this.nextTetromino, false);
      // TODO validate game over without an input
      this.validateGameOver(oldMatrix);
    } else {
      this.doAction('ArrowDown');
    }
  }

  private drawBoard(): void {
    const copyMatrix: number[][] = JSON.parse(JSON.stringify(this.matrix));

    copyMatrix.forEach((row, y) => {
      row.forEach((value, x) => {
        this.ctx.fillStyle = this.tetrominoService.getColor(value);
        this.ctx.fillRect(x * this.BLOCK, y * this.BLOCK, this.BLOCK, this.BLOCK);
      });
    });

    this.matrix = copyMatrix;
  }

  private sliceMatrix(): void {
    const copyMatrix: number[][] = JSON.parse(JSON.stringify(this.matrix));

    // count filled line and replace it from matrix with an empty array
    copyMatrix.forEach((row, y) => {
      const tempFiltered = row.filter(v => v > 7);
      if (tempFiltered.length === 10) {
        copyMatrix.splice(y, 1);
        const newArray = Array(10).fill(0);
        copyMatrix.unshift(newArray);
      }
    });

    this.matrix = copyMatrix;
    this.nextTetromino = null;
  }

  start(): void {
    this.isRunning = true;
    this.render();
  }

  restart(): void {
    this.reset();
    this.start();
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
        this.validateScore().then(() => {
          this.sliceMatrix();
        });
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  private keyEvent(event: KeyboardEvent): void {
    if (this.isRunning && this.nextTetromino) {
      this.doAction(event.key);
    }
  }

  private async validateScore(): Promise<void> {
    let scoreCount = 0;
    const copyMatrix: number[][] = JSON.parse(JSON.stringify(this.matrix));

    this.matrix.forEach((row, y) => {
      const tempFiltered = row.filter(v => v > 0 && v < 8);
      if (tempFiltered.length === 10) {
        copyMatrix[y].forEach((value, x) => copyMatrix[y][x] = 8);
        scoreCount += 1;
      }
    });
    this.matrix = copyMatrix;
    this.draw$.emit();

    if (scoreCount > 0) {
      this.sleep -= this.sleep > 0 ? 5 : 0;
      this.clearedLines += scoreCount;
      this.score += Math.pow(5, scoreCount);
      this.matrix = copyMatrix;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  private reset(): void {
    if (this.requestAnimationId) {
      cancelAnimationFrame(this.requestAnimationId);
    }
    this.sleep = 100;
    this.fps = 0;
    this.score = 0;
    this.clearedLines = 0;
    this.nextTetromino = null;
    this.gameOver = true;
    this.matrix = Array.from({length: this.HEIGHT},
      () => new Array(this.WIDTH).fill(0));
  }

  private validateGameOver(oldMatrix: number[][]): void {
    const copyTetromino: TetrominoInterface = JSON.parse(JSON.stringify(this.nextTetromino));
    copyTetromino.type = 9;

    const copyMatrix = this.tetrominoService.updateMatrix(oldMatrix, copyTetromino, false);

    oldMatrix.forEach((row, y) => {
      row.forEach((v, x) => {
        if (v !== 0 && copyMatrix[y][x] !== 0 && v !== copyMatrix[y][x]) {
          this.gameOver = true;
          this.isRunning = false;
        }
      });
    });

    if (this.gameOver) {
      this.openDialog();
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(GameOverDialogComponent, {
      width: '350px', height: '200px'
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((action) => {
      if (action) {
        this.restart();
      }
    });
  }
}
