import {EventEmitter, Injectable, Output} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private startEvent$ = new EventEmitter<void>();
  private pauseEvent$ = new EventEmitter<void>();
  private resetEvent$ = new EventEmitter<void>();

  constructor() { }

  raiseStartEvent(): void {
    this.startEvent$.emit();
  }

  raisePauseEvent(): void {
    this.pauseEvent$.emit();
  }

  raiseResetEvent(): void {
    this.resetEvent.emit();
  }

  get startEvent(): EventEmitter<void> {
    return this.startEvent$;
  }

  get pauseEvent(): EventEmitter<void> {
    return this.pauseEvent$;
  }

  get resetEvent(): EventEmitter<void> {
    return this.resetEvent$;
  }

}
