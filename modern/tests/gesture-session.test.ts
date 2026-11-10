import {describe,it,expect} from 'vitest';
import {GestureSession} from '@/lib/gesture-session';
describe('one action per deliberate gesture',()=>{
  it('accepts one strong wheel action and absorbs the entire momentum train beyond a transition duration',()=>{
    const gate=new GestureSession();expect(gate.wheel(120,0,false)).toBe(1);
    for(let t=30;t<2400;t+=30)expect(gate.wheel(Math.max(4,100-t/30),t,false)).toBe(0);
    expect(gate.wheel(120,2800,false)).toBe(1);
  });
  it('requires accumulated distance and a meaningful peak, ignoring tiny isolated tails',()=>{
    const gate=new GestureSession();for(let t=0;t<2000;t+=300)expect(gate.wheel(8,t,false)).toBe(0);
    expect(gate.wheel(12,2500,false)).toBe(0);expect(gate.wheel(12,2520,false)).toBe(0);expect(gate.wheel(12,2540,false)).toBe(1);
  });
  it('does not queue a reversal or a fresh gesture received during a transition',()=>{
    const gate=new GestureSession();expect(gate.wheel(120,0,false)).toBe(1);expect(gate.wheel(-160,400,true)).toBe(0);expect(gate.wheel(-80,500,false)).toBe(0);expect(gate.wheel(-80,900,false)).toBe(-1);
  });
  it('treats every touch contact as one gesture and never retriggers a held swipe',()=>{
    const gate=new GestureSession();gate.press();expect(gate.touch(30,false)).toBe(0);expect(gate.touch(70,false)).toBe(1);expect(gate.touch(-120,false)).toBe(0);gate.press();expect(gate.touch(-70,false)).toBe(-1);
  });
  it('consumes touches that started while video or transition input was locked',()=>{
    const gate=new GestureSession();gate.press();expect(gate.touch(60,true)).toBe(0);expect(gate.touch(100,false)).toBe(0);gate.press();expect(gate.touch(100,false)).toBe(1);
  });
  it('discards a contact pressed during a lock even if its first movement arrives after settling',()=>{
    const gate=new GestureSession();gate.press(true);expect(gate.touch(100,false)).toBe(0);gate.press(false);expect(gate.touch(100,false)).toBe(1);
  });
});
