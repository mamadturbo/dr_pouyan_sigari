import {test,expect,type Page} from '@playwright/test';
async function presentation(page:Page,path='/'){
  await page.setViewportSize({width:1440,height:900});await page.goto(path);
  await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','fullpage');
  await page.mouse.move(1000,450);
}
async function landed(page:Page,index:number){
  const shell=page.locator('#page-shell');await expect(shell).toHaveAttribute('data-current-section',String(index));await expect(shell).toHaveAttribute('data-transitioning','false');
  await expect.poll(()=>page.evaluate(index=>{const shell=document.querySelector('#page-shell')!;const p=document.querySelectorAll<HTMLElement>('[data-fullpage-section]')[index];return Math.abs(p.getBoundingClientRect().top-shell.getBoundingClientRect().top);},index)).toBeLessThan(2);
}
test('one down/up gesture lands exactly one panel with no intermediate resting position',async({page})=>{
  await presentation(page);await landed(page,0);await page.mouse.wheel(0,120);await landed(page,1);
  await page.waitForTimeout(320);await page.mouse.wheel(0,-120);await landed(page,0);
});
test('rapid wheel burst, long trackpad momentum and opposite input during transition are absorbed',async({page})=>{
  await presentation(page);
  await page.evaluate(async()=>{const target=document.querySelector('#page-shell')!;for(let i=0;i<65;i++){target.dispatchEvent(new WheelEvent('wheel',{deltaY:i===10?-100:Math.max(4,90-i),bubbles:true,cancelable:true}));await new Promise(r=>setTimeout(r,24));}});
  await landed(page,1);await expect(page.locator('.story-card')).toHaveAttribute('data-playback','idle');
  await page.waitForTimeout(320);await page.mouse.wheel(0,-120);await landed(page,0);
});
test('doctor steps consume gestures before leaving and preserve decoded frames when returning',async({page})=>{
  await presentation(page,'/#about');await landed(page,4);
  await page.mouse.wheel(0,120);await expect(page.locator('.story-card')).toHaveAttribute('data-playback','complete');await landed(page,4);await expect(page.locator('.story-surgical')).toBeVisible();
  await page.waitForTimeout(320);await page.mouse.wheel(0,120);await landed(page,5);
  await page.mouse.wheel(0,-120);await landed(page,4);await expect(page.locator('.story-surgical')).toBeVisible();
  await page.mouse.wheel(0,-120);await expect(page.locator('.story-academic')).toBeVisible();await landed(page,4);
  await page.waitForTimeout(320);await page.mouse.wheel(0,-120);await landed(page,3);
});
test('arrows, Home/End, held keys and boundaries stay in range',async({page})=>{
  await presentation(page);await page.keyboard.press('ArrowUp');await landed(page,0);
  await page.keyboard.press('End');await landed(page,7);await page.keyboard.press('ArrowDown');await landed(page,7);
  await page.keyboard.press('Home');await landed(page,0);
  await page.keyboard.down('ArrowDown');await page.keyboard.down('ArrowDown');await landed(page,1);await page.keyboard.up('ArrowDown');
  await expect(page.locator('#experience')).toBeFocused();
});
test('hash refresh and resize preserve a deterministic section; small screens use natural flow',async({page})=>{
  await presentation(page,'/#services');await landed(page,3);await page.reload();await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','fullpage');await landed(page,3);
  await page.setViewportSize({width:1440,height:1000});await landed(page,3);
  await page.setViewportSize({width:360,height:640});await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','natural');await expect(page.locator('html')).not.toHaveClass(/fullpage-enabled/);
  await expect(page.locator('.presentation-navigation')).toBeHidden();await expect(page.locator('.site-footer')).not.toHaveAttribute('inert','');
  await page.keyboard.press('Escape');await page.mouse.move(200,500);await page.mouse.wheel(0,600);expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(0);
});
test('content routes stay natural and returning creates only one owned Observer',async({page})=>{
  await page.addInitScript(()=>{
    const counts=new Map<EventTarget,Set<EventListenerOrEventListenerObject>>();
    const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener;
    EventTarget.prototype.addEventListener=function(type,listener,options){if(type==='wheel'&&this instanceof HTMLElement&&this.id==='page-shell'&&listener){if(!counts.has(this))counts.set(this,new Set());counts.get(this)!.add(listener);}return add.call(this,type,listener,options);};
    EventTarget.prototype.removeEventListener=function(type,listener,options){if(type==='wheel'&&listener)counts.get(this)?.delete(listener);return remove.call(this,type,listener,options);};
    (window as unknown as {wheelListeners:()=>number}).wheelListeners=()=>[...counts.values()].reduce((sum,set)=>sum+set.size,0);
  });
  await presentation(page);expect(await page.evaluate(()=>(window as unknown as {wheelListeners:()=>number}).wheelListeners())).toBe(2);
  await page.getByRole('navigation',{name:'منوی اصلی'}).getByRole('link',{name:'درباره پزشک',exact:true}).click();
  await expect(page).toHaveURL(/about/);await expect(page.locator('html')).not.toHaveClass(/fullpage-enabled/);expect(await page.evaluate(()=>(window as unknown as {wheelListeners:()=>number}).wheelListeners())).toBe(0);
  await page.mouse.move(1000,500);await page.mouse.wheel(0,550);await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(50);
  await page.locator('.header-inner .brand').click();await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','fullpage');expect(await page.evaluate(()=>(window as unknown as {wheelListeners:()=>number}).wheelListeners())).toBe(2);
  for(const path of ['/about/','/expertise/','/publications/','/contact/']){await page.goto(path);await expect(page.locator('html')).not.toHaveClass(/fullpage-enabled/);expect(await page.evaluate(()=>(window as unknown as {wheelListeners:()=>number}).wheelListeners())).toBe(0);}
});
test('real browser touch input produces one transition per contact',async({browser})=>{
  const context=await browser.newContext({hasTouch:true,viewport:{width:1440,height:900}});const page=await context.newPage();
  await presentation(page);const cdp=await context.newCDPSession(page);
  const swipe=async(start:number,end:number)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:1000,y:start}]});for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:1000,y:start+(end-start)*i/8}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
  await swipe(650,350);await landed(page,1);await swipe(350,650);await landed(page,0);await context.close();
});
test('reduced motion restores readable natural scrolling',async({page})=>{
  await presentation(page,'/#research');
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','natural');await expect(page.locator('.story-static')).toBeVisible();
  expect(await page.locator('[inert]').count()).toBe(1); // Only the hidden surgical text state remains inert.
});

test('skip focuses the current panel and free reading survives reload',async({page})=>{
  await presentation(page,'/#services');
  await landed(page,3);
  await page.locator('.skip-link').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#services')).toBeFocused();
  await landed(page,3);
  await page.getByRole('button',{name:'اسکرول آزاد',exact:true}).click();
  await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','natural');
  await expect(page.locator('.story-static')).toBeVisible();
  await expect(page.locator('.story-scroll')).toBeHidden();
  await expect(page.locator('#services h2')).toBeInViewport();
  await page.reload();
  await expect(page.locator('main')).toHaveAttribute('data-reading-mode','free');
  const restore=page.getByRole('button',{name:'پیمایش بخش‌به‌بخش'});
  await expect(restore).toBeVisible();
  await restore.click();
  await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','fullpage');
  await landed(page,3);
});

test('section entrances play once on arrival and respect live reduced-motion changes',async({page})=>{
  await page.addInitScript(()=>{
    const animate=Element.prototype.animate;
    Element.prototype.animate=function(keyframes,options){
      const animation=animate.call(this,keyframes,options);
      if(animation.id==='clinic-arrival'){
        const panel=this.closest('[data-fullpage-section]');
        if(panel)document.body.dataset.arrivals=(document.body.dataset.arrivals??'')+panel.id+' ';
      }
      return animation;
    };
  });
  await presentation(page);
  await expect(page.locator('#hero-title')).toHaveCSS('animation-name','clinic-entry');
  await expect(page.locator('.service-grid')).not.toBeInViewport();
  await expect(page.locator('body')).not.toHaveAttribute('data-arrivals',/services/);
  const navigation=page.getByRole('navigation',{name:'پیمایش بخش‌های صفحه'});
  const services=navigation.getByRole('button',{name:/خدمات/});
  const [progress]=await Promise.all([
    page.evaluate(async()=>{
      const shell=document.getElementById('page-shell')!;
      const card=document.querySelector('#services .service-card')!;
      const samples=new Set<number>();
      const timeout=performance.now()+3500;
      while(shell.dataset.currentSection!=='3'&&performance.now()<timeout){
        await new Promise(requestAnimationFrame);
        const animation=card.getAnimations().find(item=>item.id==='clinic-arrival');
        if(animation?.playState==='paused'&&Number(animation.currentTime)>0) samples.add(Number(animation.currentTime));
      }
      return samples.size;
    }),
    services.click(),
  ]);
  expect(progress).toBeGreaterThan(1);
  await landed(page,3);
  await expect(page.locator('body')).toHaveAttribute('data-arrivals',/services/);
  await expect(page.locator('body')).not.toHaveAttribute('data-arrivals',/experience|portfolio/);
  const firstVisit=await page.locator('body').getAttribute('data-arrivals');
  await navigation.getByRole('button',{name:/بخش 1:/}).click();
  await landed(page,0);
  await services.click();
  await landed(page,3);
  await expect(page.locator('body')).toHaveAttribute('data-arrivals',firstVisit!);

  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','natural');
  await expect(page.locator('#hero-title')).toHaveCSS('animation-name','none');
  await page.locator('#contact .contact-phone').scrollIntoViewIfNeeded();
  await expect(page.locator('.contact-phone')).toBeInViewport();
  await expect(page.locator('body')).toHaveAttribute('data-arrivals',firstVisit!);
});
test('media failure and manual playback do not deadlock full-page navigation',async({page})=>{
  await page.route('**/doctor-turn-flow.mp4',r=>r.abort());await presentation(page,'/#about');await landed(page,4);
  await page.keyboard.press('ArrowDown');await expect(page.locator('.story-card')).toHaveAttribute('data-result','error');await expect(page.locator('#page-shell')).toHaveAttribute('data-transitioning','false');
  await page.mouse.move(1000,450);await page.mouse.wheel(0,120);await landed(page,5);await expect(page.locator('html')).not.toHaveClass(/story-scroll-locked/);
});
test('laptop presentation keeps the header readable and both navigation controls separate',async({page},info)=>{
  await presentation(page,'/#about');await page.setViewportSize({width:1366,height:768});await landed(page,4);
  await expect(page.locator('.story-play')).toHaveCount(0);await expect(page.locator('.presentation-navigation button')).toHaveCount(8);await expect(page.locator('.site-header')).toHaveCSS('background-color','rgb(0, 77, 62)');
  const frame=(await page.locator('.frame-stage').boundingBox())!;expect(frame.y).toBeGreaterThan(92);expect(frame.y+frame.height).toBeLessThan(768-50);
  await page.screenshot({path:info.outputPath('fullpage-laptop.png')});
});

test('compact preview keeps all content reachable and falls back when sections do not fit',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  for(const [width,height] of [[1100,646],[805,646]]){
    await page.setViewportSize({width,height});await page.goto('/');
    await expect(page.locator('main')).toHaveAttribute('data-scroll-mode',/natural|fullpage/);
    if(await page.locator('main').getAttribute('data-scroll-mode')==='fullpage')await page.getByRole('button',{name:'اسکرول آزاد',exact:true}).click();
    await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','natural');
    for(const id of ['experience','portfolio','services','about','patient-journey','research','contact']){await page.locator('#'+id).scrollIntoViewIfNeeded();await expect(page.locator('#'+id)).toBeVisible();}
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:info.outputPath('compact-'+width+'.png')});
  }
  expect(errors).toEqual([]);
});
test('compact touch presentation consumes contacts begun during a transition',async({browser})=>{
  const context=await browser.newContext({hasTouch:true,viewport:{width:1440,height:900}});const page=await context.newPage();
  await page.goto('/');await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','fullpage');
  const cdp=await context.newCDPSession(page);
  const touch=(type:'touchStart'|'touchMove'|'touchEnd',y?:number)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:y===undefined?[]:[{x:600,y}]});
  await touch('touchStart',500);await touch('touchMove',300);await touch('touchEnd');
  await expect(page.locator('#page-shell')).toHaveAttribute('data-transitioning','true');
  await touch('touchStart',300);await landed(page,1);
  await touch('touchMove',500);await touch('touchEnd');await page.waitForTimeout(1100);await landed(page,1);
  await touch('touchStart',300);await touch('touchMove',500);await touch('touchEnd');await landed(page,0);
  await context.close();
});

test('resizing an embedded browser keeps content accessible without a scroll trap',async({page})=>{
  await page.setViewportSize({width:1280,height:720});await page.goto('/#services');
  for(const [width,height] of [[1280,720],[1100,646],[1280,720]]){
    await page.setViewportSize({width,height});
    await expect(page.locator('main')).toHaveAttribute('data-scroll-mode',/natural|fullpage/);
    if(await page.locator('main').getAttribute('data-scroll-mode')==='fullpage')await page.getByRole('button',{name:'اسکرول آزاد',exact:true}).click();
    await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','natural');
    await page.locator('#services').scrollIntoViewIfNeeded();await expect(page.locator('#services')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});
