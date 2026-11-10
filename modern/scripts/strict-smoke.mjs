import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
await page.addInitScript(()=>{
  const active=new Map();
  const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener=function(type,listener,options){if(type==='wheel'&&this instanceof HTMLElement&&this.id==='page-shell'){if(!active.has(this))active.set(this,new Set());active.get(this).add(listener);}return add.call(this,type,listener,options);};
  EventTarget.prototype.removeEventListener=function(type,listener,options){if(type==='wheel')active.get(this)?.delete(listener);return remove.call(this,type,listener,options);};
  window.__wheelCount=()=>[...active.values()].reduce((sum,set)=>sum+set.size,0);
});
try{
  await page.goto('http://localhost:3001/');
  await page.locator('main[data-scroll-mode="fullpage"]').waitFor({timeout:30000});
  const mounted=await page.evaluate(()=>window.__wheelCount());
  if(mounted!==2)throw new Error('Expected one Observer plus its zoom helper after Strict Mode mount, got '+mounted);
  await page.mouse.move(1000,450);await page.mouse.wheel(0,120);await page.waitForFunction(()=>document.querySelector('#page-shell')?.dataset.currentSection==='1');
  await page.waitForFunction(()=>document.querySelector('#page-shell')?.dataset.transitioning==='false');
  await page.keyboard.press('ArrowDown');
  await page.waitForFunction(()=>document.querySelector('.story-card')?.dataset.playback==='complete');
  await page.getByRole('navigation',{name:'منوی اصلی'}).getByRole('link',{name:'دربارهٔ پزشک',exact:true}).click();
  await page.waitForURL('**/about/');
  const unmounted=await page.evaluate(()=>({wheel:window.__wheelCount(),locked:document.documentElement.classList.contains('fullpage-enabled')||document.documentElement.classList.contains('story-scroll-locked')}));
  if(unmounted.wheel!==0||unmounted.locked||errors.length)throw new Error(JSON.stringify({unmounted,errors}));
  await page.locator('.header-inner .brand').click();await page.locator('main[data-scroll-mode="fullpage"]').waitFor();
  const remounted=await page.evaluate(()=>window.__wheelCount());
  if(remounted!==2)throw new Error('Duplicate listener on remount: '+remounted);
  const result={reactStrictMode:true,ownedObserverInstances:1,mountedRootWheelHandlers:mounted,unmounted,remountedRootWheelHandlers:remounted,pageErrors:errors};
  writeFileSync('strict-mode-validation.json',JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{await browser.close();}
