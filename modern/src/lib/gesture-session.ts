/** One accepted action per wheel burst or physical touch contact. No queued input. */
export class GestureSession {
  private lastWheel = -Infinity;
  private accumulated = 0;
  private peak = 0;
  private consumed = false;
  private touchConsumed = false;
  wheel(delta:number, time:number, busy:boolean):number {
    if(time-this.lastWheel>280){this.accumulated=0;this.peak=0;this.consumed=false;}
    this.lastWheel=time;
    if(busy){this.consumed=true;return 0;}
    if(this.consumed||Math.abs(delta)<4)return 0;
    if(Math.sign(delta)!==Math.sign(this.accumulated)){this.accumulated=0;this.peak=0;}
    this.accumulated+=delta;this.peak=Math.max(this.peak,Math.abs(delta));
    if(Math.abs(this.accumulated)<32||this.peak<12)return 0;
    this.consumed=true;return Math.sign(this.accumulated);
  }
  press(busy=false){this.touchConsumed=busy;}
  touch(distance:number,busy:boolean):number {
    if(busy){this.touchConsumed=true;return 0;}
    if(this.touchConsumed||Math.abs(distance)<50)return 0;
    this.touchConsumed=true;return Math.sign(distance);
  }
}
