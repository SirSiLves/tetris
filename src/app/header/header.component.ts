import {Component, OnInit} from '@angular/core';
import {StateService} from '../services/state.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isRunning = false;
  isPaused = true;
  newGame = true;

  constructor(
    private stateService: StateService
  ) {
  }

  ngOnInit(): void {

  }

  raiseStartEvent(): void {
    this.stateService.raiseStartEvent();
    this.isRunning = true;
    this.isPaused = false;
    this.newGame = false;
  }

  raisePauseEvent(): void {
    this.stateService.raisePauseEvent();
    this.isRunning = false;
    this.isPaused = true;
  }

  raiseRestartEvent(): void {
    this.stateService.raiseResetEvent();
    this.isPaused = false;
    this.isRunning = true;
  }

}
