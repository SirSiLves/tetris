import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tetris-app';

  @Output() startEvent$ = new EventEmitter<void>();
  @Output() pauseEvent$ = new EventEmitter<void>();

  raiseStartEvent(): void {
    this.startEvent$.emit();
  }

  raisePauseEvent(): void {
    this.pauseEvent$.emit();
  }
}
