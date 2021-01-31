import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RotateService {

  constructor() {
  }

  rotate(px: number, py: number, r: number): number {

    switch (r % 4) {
      case 0:
        return py * 4 + px;           // 0  degrees
      case 1:
        return 12 + py - (px * 4);    //90  degrees
      case 2:
        return 15 - (py * 4) - px;    //180 degrees
      case 3:
        return 3 - py + (px * 4);     //270 degrees
      default:
        return 0
    }

  }
}
