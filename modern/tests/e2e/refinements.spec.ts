import {test,expect,type Page} from '@playwright/test';
async function ready(page:Page,width=1440,height=900){
  await page.setViewportSize({width,height});await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','fullpage');
}
async function section(page:Page,index:number){
  if(index===0)await page.keyboard.press('Home');
  else await page.getByRole('button',{name:'بخش '+(index+1)+':',exact:false}).click();
  await expect(page.locator('#page-shell')).toHaveAttribute('data-current-section',String(index));
  await expect(page.locator('#page-shell')).toHaveAttribute('data-transitioning','false');
}
test('number navigation animates to every section and the footer shares the contact panel',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await ready(page,1440,900);
  await expect(page.locator('.photo-signature,.scroll-cue,.service-number,.story-controls,.story-progress,.visual-label')).toHaveCount(0);
  await expect(page.locator('#introduction img')).toBeVisible();
  await page.screenshot({path:info.outputPath('hero-refined.png')});
  for(const index of [1,3,5,6,7])await section(page,index);
  const footer=await page.locator('.site-footer').boundingBox();
  const contact=await page.locator('#contact').boundingBox();
  expect(footer!.height).toBeLessThan(200);expect(footer!.y+footer!.height).toBeLessThanOrEqual(902);
  expect(Math.abs(footer!.y-contact!.y-contact!.height)).toBeLessThan(2);
  await expect(page.locator('.site-footer')).not.toHaveAttribute('inert','');
  const copyright=await page.locator('.footer-bottom').boundingBox();
  const numbers=await page.locator('.presentation-navigation').boundingBox();
  expect(numbers!.y+numbers!.height).toBeLessThan(copyright!.y);
  await page.screenshot({path:info.outputPath('contact-footer.png')});
  await section(page,0);expect(errors).toEqual([]);
});
test('experience cards open details, contain focus and restore the trigger without advancing sections',async({page},info)=>{
  await ready(page);await section(page,1);
  const cards=page.locator('.experience-card');
  await expect(cards).toHaveCount(4);
  await cards.nth(3).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading')).toHaveText('برنامهٔ پنل ایمپلنت و سینوس');
  await expect(dialog.getByRole('link')).toHaveAttribute('href',/Molavi-f.pdf$/);
  await page.keyboard.press('Tab');await page.keyboard.press('Tab');
  expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('ArrowDown');await page.mouse.wheel(0,120);
  await expect(page.locator('#page-shell')).toHaveAttribute('data-current-section','1');
  await page.screenshot({path:info.outputPath('experience-expanded.png')});
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(cards.nth(3)).toBeFocused();
  await cards.first().click();await expect(dialog).toBeVisible();
  await page.mouse.click(10,120);await expect(dialog).toHaveCount(0);await expect(cards.first()).toBeFocused();
  await cards.nth(1).click();await dialog.getByRole('button',{name:'بستن جزئیات سابقه'}).click();await expect(dialog).toHaveCount(0);
  await page.keyboard.press('ArrowDown');await expect(page.locator('#page-shell')).toHaveAttribute('data-current-section','2');
  await section(page,1);
  await page.keyboard.press('ArrowUp');await expect(page.locator('#page-shell')).toHaveAttribute('data-current-section','0');
});
test('experience cards fit compact presentation and remain usable on mobile and reduced motion',async({page},info)=>{
  await ready(page,1440,900);await section(page,1);
  await expect(page.locator('.experience-card')).toHaveCount(4);
  await page.screenshot({path:info.outputPath('compact-experience-cards.png')});
  // Keep laptop width, but make the viewport too short for paged scrolling.
  await page.setViewportSize({width:1366,height:550});
  await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','natural');
  await expect(page.locator('.experience-card')).toHaveCount(4);
  await page.setViewportSize({width:1024,height:900});
  await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','natural');
  await expect(page.locator('.experience-card')).toHaveCount(4);
  await page.setViewportSize({width:390,height:900});
  await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','natural');
  await page.locator('.experience-card').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const box=(await page.locator('.experience-dialog-panel').boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(390);
  expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(900);
  await page.screenshot({path:info.outputPath('mobile-experience-expanded.png')});
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.experience-card').last().click();await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe('');
});
test('touch presentation leaves the experience section with one swipe',async({browser})=>{
  const context=await browser.newContext({hasTouch:true,viewport:{width:1440,height:900}});
  const page=await context.newPage();await page.goto('/#experience');
  await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','fullpage');
  await expect(page.locator('.experience-card')).toHaveCount(4);
  const cdp=await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:600,y:500}]});
  for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:600,y:500-i*25}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect(page.locator('#page-shell')).toHaveAttribute('data-current-section','2');
  await context.close();
});

test('hover reveals distant page circles and fades their neighbors before restoring the current page',async({page},info)=>{
  await ready(page,1440,900);
  const buttons=page.locator('.presentation-navigation button');
  await expect(buttons.nth(7)).toHaveCSS('opacity','0');
  await buttons.nth(7).hover();
  await expect(buttons.nth(7)).toHaveCSS('opacity','1');
  await expect(buttons.nth(6)).toHaveCSS('opacity','0.55');
  await expect(buttons.nth(5)).toHaveCSS('opacity','0.24');
  await expect(buttons.nth(4)).toHaveCSS('opacity','0.08');
  await expect(buttons.nth(3)).toHaveCSS('opacity','0');
  await expect(buttons.nth(0)).toHaveAttribute('aria-current','page');
  await page.screenshot({path:info.outputPath('hover-distant-circle.png')});
  await buttons.nth(6).hover();
  await expect(buttons.nth(6)).toHaveCSS('opacity','1');
  await expect(buttons.nth(7)).toHaveCSS('opacity','0.55');
  await expect(buttons.nth(5)).toHaveCSS('opacity','0.55');
  await page.mouse.move(600,350);
  await expect(buttons.nth(0)).toHaveCSS('opacity','1');
  await expect(buttons.nth(1)).toHaveCSS('opacity','0.55');
  await expect(buttons.nth(7)).toHaveCSS('opacity','0');
  await buttons.nth(7).click();
  await expect(page.locator('#page-shell')).toHaveAttribute('data-current-section','7');
  await expect(page.locator('#page-shell')).toHaveAttribute('data-transitioning','false');
  await page.mouse.move(600,350);
  await expect(buttons.nth(7)).toHaveCSS('opacity','1');
});

test('right-side numbers stay vertical, highlight only the current section and animate click and wheel navigation',async({page},info)=>{
  await ready(page,1440,900);
  const rail=page.locator('.presentation-navigation');
  const buttons=rail.locator('button');
  const box=(await rail.boundingBox())!;
  const viewportWidth=await page.evaluate(()=>document.documentElement.clientWidth);
  expect(box.x).toBeGreaterThan(viewportWidth-64);expect(box.x+box.width).toBeLessThanOrEqual(viewportWidth);expect(box.height).toBeGreaterThan(box.width*5);
  const first=(await buttons.nth(0).boundingBox())!,second=(await buttons.nth(1).boundingBox())!;
  expect(Math.abs(first.x+first.width/2-second.x-second.width/2)).toBeLessThan(1);
  expect(second.y).toBeGreaterThan(first.y+first.height-4);
  await expect(buttons.nth(0)).toHaveCSS('opacity','1');
  await expect(buttons.nth(0)).toHaveCSS('filter','blur(0px)');
  await expect(buttons.nth(1)).toHaveCSS('opacity','0.55');
  await expect(buttons.nth(2)).toHaveCSS('opacity','0.24');
  await expect(buttons.nth(3)).toHaveCSS('opacity','0.08');
  await expect(buttons.nth(4)).toHaveCSS('opacity','0');
  await expect(buttons.nth(0)).toHaveCSS('border-radius','50%');
  await expect(buttons.nth(1)).toHaveCSS('filter','blur(0.35px)');
  await page.screenshot({path:info.outputPath('vertical-page-numbers.png')});
  await section(page,1);
  await buttons.nth(2).click();
  // A real intermediate position proves that clicking animates the scroll.
  await expect.poll(()=>page.evaluate(()=>{
    const shell=document.querySelector('#page-shell')!;
    const target=document.querySelector('#portfolio')!;
    const destination=target.getBoundingClientRect().top-shell.getBoundingClientRect().top+shell.scrollTop;
    return shell.scrollTop>1&&shell.scrollTop<destination-1;
  })).toBe(true);
  await expect(page.locator('#page-shell')).toHaveAttribute('data-current-section','2');
  await expect(page.locator('#page-shell')).toHaveAttribute('data-transitioning','false');
  await page.mouse.move(600,350);
  await expect(buttons.nth(2)).toHaveCSS('opacity','1');
  await expect(buttons.nth(0)).toHaveCSS('opacity','0.24');
  await expect(buttons.nth(3)).toHaveCSS('opacity','0.55');
  await expect(buttons.nth(1)).toHaveCSS('opacity','0.55');
  await page.mouse.wheel(0,120);
  await expect(page.locator('#page-shell')).toHaveAttribute('data-current-section','3');
  await expect(page.locator('#page-shell')).toHaveAttribute('data-transitioning','false');
  await expect(buttons.nth(3)).toHaveAttribute('aria-current','page');
  await page.screenshot({path:info.outputPath('vertical-numbers-light-section.png')});
});
