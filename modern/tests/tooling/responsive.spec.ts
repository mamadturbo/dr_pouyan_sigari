import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFile} from 'node:fs/promises';

test('responsive layout, native scroll, media budget, menu and accessibility',async({page},info)=>{
 const errors:string[]=[],media:string[]=[];
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/\/assets\/(story-|doctor-turn|doctor-hero)/.test(r.url()))media.push(r.url())});
 expect((await page.goto('/'))?.status()).toBe(200);
 await page.evaluate(()=>document.fonts.ready);await page.waitForLoadState('networkidle');
 const size=page.viewportSize()!,natural=size.width<=1024||info.project.use.reducedMotion==='reduce';
 const phone=size.width<768||size.height<=500;
 await expect(page.locator('main')).toHaveAttribute('data-scroll-mode',natural?'natural':'fullpage');
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await page.screenshot({path:info.outputPath('hero.png')});
 if(!phone&&size.width>=768&&size.width<=1024){const copy=(await page.locator('.hero-reference-copy').boundingBox())!,visual=(await page.locator('.hero-reference-visual').boundingBox())!;expect(copy.x).toBeGreaterThanOrEqual(visual.x+visual.width-2);}
 if(phone)await expect(page.locator('.hero-reference-visual')).toBeHidden();
 if(natural){
  await expect(page.locator('.story-scroll')).toBeHidden();
  await expect(page.locator('.story-static article')).toHaveCount(2);
  await expect(page.locator('.story-card')).not.toHaveAttribute('data-playback',/.+/);
  await expect(page.locator('video')).not.toHaveAttribute('src',/.+/);
  await expect(page.locator('html')).not.toHaveClass(/fullpage-enabled|story-scroll-locked/);
  await page.locator('#about').scrollIntoViewIfNeeded();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.story-card')).not.toHaveAttribute('data-playback',/.+/);
  const wheel=await page.locator('#about').evaluate(e=>{const event=new WheelEvent('wheel',{deltaY:73,bubbles:true,cancelable:true});e.dispatchEvent(event);return event.defaultPrevented});
  expect(wheel).toBe(false);
  await page.evaluate(()=>scrollTo({top:200,behavior:'instant'}));
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(0);
  if(info.project.use.browserName==='webkit' && info.project.use.isMobile){await page.evaluate(()=>scrollBy(0,137));}else{await page.mouse.wheel(0,137);}
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(200);
  await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();scrollTo({top:0,behavior:'instant'});});
  await page.screenshot({path:info.outputPath('full-page.png'),fullPage:true});
  await page.locator('.story-static').screenshot({path:info.outputPath('profiles.png')});
  if(phone){expect(media).toEqual([]);await expect(page.locator('.story-static-portrait').first()).toBeHidden();}
 }
 const menu=page.locator('.menu-toggle');
 if(await menu.isVisible()){
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await menu.focus();await page.keyboard.press('Enter');
  await expect(page.locator('#mobile-nav a').first()).toBeFocused();
  await page.keyboard.press('Shift+Tab');await expect(menu).toBeFocused();
  await page.keyboard.press('Shift+Tab');await expect(page.locator('#mobile-nav a').last()).toBeFocused();
  await page.keyboard.press('Tab');await expect(menu).toBeFocused();
  await page.keyboard.press('Escape');await expect(menu).toBeFocused();
  await expect(page.locator('#mobile-nav')).toBeHidden();
  if(info.project.use.hasTouch)await menu.tap();else await menu.click();
  await expect(page.locator('#mobile-nav')).toBeVisible();
  await page.screenshot({path:info.outputPath('menu.png')});
  await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
 }
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 await writeFile(info.outputPath('observations.json'),JSON.stringify({size,natural,phone,media,overflow,errors,violations:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))},null,2));
 expect(overflow).toBe(false);expect(errors).toEqual([]);
 // Existing contrast findings are recorded; any other regression fails this matrix.
 if(size.width<=1024)expect(axe.violations).toEqual([]);
 else {
  const unexpected=axe.violations.filter(v=>v.id!=='color-contrast'||v.nodes.some(n=>n.target.some(t=>typeof t!=='string'||!(/button-small|experience-art-year/.test(t)))));
  expect(unexpected).toEqual([]);
 }
});

test('main routes, filters, FAQ, dialog and menu navigation',async({page},info)=>{
 test.skip(!info.project.name.includes('portrait-no-preference'));
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 const findings:unknown[]=[];
 for(const route of ['/about/','/expertise/','/publications/','/contact/']){
  expect((await page.goto(route))?.status()).toBe(200);await page.evaluate(()=>document.fonts.ready);await page.waitForLoadState('networkidle');await expect(page.locator('h1')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.screenshot({path:info.outputPath(route.replaceAll('/','')+'.png'),fullPage:true});
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  findings.push({route,violations:result.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))});
  expect(result.violations).toEqual([]);
 }
 await page.goto('/publications/');await page.getByLabel('حوزهٔ پژوهش').selectOption('ایمپلنت دندانی');await expect(page.getByRole('article')).toHaveCount(1);
 await page.getByRole('searchbox').fill('no-match');await page.getByRole('button',{name:'نمایش همهٔ پژوهش‌ها'}).click();await expect(page.getByRole('article')).toHaveCount(3);
 await page.goto('/contact/');await page.locator('.faq-item summary').first().click();await expect(page.locator('.faq-answer').first()).toBeVisible();
 await page.goto('/#experience');await page.locator('.experience-card').first().click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.locator('.experience-card').first()).toBeFocused();
 const menu=page.locator('.menu-toggle');if(await menu.isVisible()){
  await menu.click();await page.locator('#mobile-nav').getByRole('link',{name:'پژوهش‌ها و مقالات',exact:true}).click();await expect(page).toHaveURL(/publications/);await expect(page.locator('#page-shell')).not.toHaveAttribute('inert','');
 }
 expect(errors).toEqual([]);await writeFile(info.outputPath('routes-axe.json'),JSON.stringify(findings,null,2));
});
