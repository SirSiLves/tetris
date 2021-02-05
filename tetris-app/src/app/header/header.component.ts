import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output() startEvent$ = new EventEmitter<void>();
  @Output() pauseEvent$ = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  raiseStartEvent(): void {
    this.startEvent$.emit();
  }

  raisePauseEvent(): void {
    this.pauseEvent$.emit();
  }
}
