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
  private sleep = 100;
  private fps = 0;
  private ctx: CanvasRenderingContext2D;
  private matrix: number[][];
  private isRunning: boolean;
  private gameOver: boolean;
  private nextTetromino: TetrominoInterface;
  private isGameOver: boolean;

  constructor(
    private tetrominoService: TetrominoService
  ) {
  }

  ngOnInit(): void {
    this.matrix = Array.from({length: this.HEIGHT},
      () => new Array(this.WIDTH).fill(0));

    this.isGameOver = false;
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
        this.clear();
        this.handleTetromino();
        this.updateScore();
        this.fps = 0;

        // console.table(this.matrix);
        console.log('Sleep: ' + this.sleep + ', Score: ' + this.score);
      }
      requestAnimationFrame(this.render.bind(this));
    }
    this.fps++;
  }

  private handleTetromino(): void {
    if (!this.nextTetromino || !this.doAction('ArrowDown')) {
      this.nextTetromino = this.tetrominoService.generateTetromino();
      this.tetrominoService.updateMatrix(this.matrix, this.nextTetromino, false);
      this.draw$.emit();
      this.sleep -= this.sleep > 0 ? 1 : 0;
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

  private updateScore(): void {
    this.score += 1;

    let scoreCount = 0;
    const tempMatrix = JSON.parse(JSON.stringify(this.matrix));

    // count filled line and remove it from matrix
    this.matrix.forEach((row, y) => {
      const tempFiltered = row.filter(v => v > 0 && v < 8);
      if (tempFiltered.length === 10) {
        tempMatrix.splice(y, 1);
        scoreCount += 1;
      }
    });

    if (scoreCount > 0) {
      // add new 0-arrays which are removed from scoring
      const newArray = [...Array(scoreCount)].map(x => Array(10).fill(0));
      newArray.forEach(r => (tempMatrix.unshift(r)));

      this.score += Math.pow(5, scoreCount);
      this.matrix = tempMatrix;
      this.nextTetromino = null;
      this.draw$.emit();
    }


    // TODO markup scoring lines
    // // markup scorer lines
    // this.matrix.forEach((row, y) => {
    //   const filteredRow = row.filter(v => v > 0);
    //   if (filteredRow.length === 10) {
    //     row.forEach((v, x) => {
    //       if (v !== 8 && v !== 9) {
    //         this.matrix[y][x] = 8;
    //       } else if (v === 8) {
    //         this.matrix[y][x] = 9;
    //       } else {
    //         this.matrix[y][x] = 0;
    //       }
    //     });
    //   }
    // });
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

  private doAction(action: string): boolean {
    this.tetrominoService.updateMatrix(this.matrix, this.nextTetromino, true);

    const origTetromino = {...this.nextTetromino};
    const testTetromino = {...this.nextTetromino};

    switch (action) {
      case 'ArrowUp':
        this.tetrominoService.rotate(this.matrix, testTetromino, 1);
        break;
      case 'ArrowDown':
        testTetromino.y += 1;
        break;
      case 'ArrowRight':
        testTetromino.x += 1;
        break;
      case 'ArrowLeft':
        testTetromino.x += -1;
        break;
    }

    const isExecuted = !this.tetrominoService.hasCollided(this.matrix, testTetromino);
    this.nextTetromino = isExecuted ? testTetromino : origTetromino;

    this.tetrominoService.updateMatrix(this.matrix, this.nextTetromino, false);
    this.draw$.emit();

    return isExecuted;
  }

  @HostListener('window:keydown', ['$event'])
  private keyEvent(event: KeyboardEvent): void {
    if (this.isRunning && this.nextTetromino) {
      this.doAction(event.key);
    }
  }

}
