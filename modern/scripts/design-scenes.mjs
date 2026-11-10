import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('design-review/scenes',{recursive:true});
const browser=await chromium.launch({channel:'chrome'});const results=[];
for(const width of [805,1440]){
 const page=await browser.newPage({viewport:{width,height:width===805?646:900}});
 await page.goto('http://127.0.0.1:4175/');await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','fullpage');
 for(let index=0;index<9;index++){
  if(index){await page.locator('.presentation-navigation button').nth(index).click();await expect(page.locator('#page-shell')).toHaveAttribute('data-current-section',String(index));await expect(page.locator('#page-shell')).toHaveAttribute('data-transitioning','false');}
  await page.screenshot({path:`design-review/scenes/section-${index}-${width}.png`});
  if(index===2){
   for(let stage=0;stage<4;stage++){
    await page.locator('.timeline-progressive h3 button').nth(stage).click();await page.waitForTimeout(320);
    const bounds=await page.locator('.timeline-detail:visible').boundingBox();
    results.push({width,stage,detailVisible:bounds.y>=80&&bounds.y+bounds.height<=(width===805?646:900)});
    await page.screenshot({path:`design-review/scenes/timeline-${stage}-${width}.png`});
   }
  }
 }
 await page.close();
}
const page=await browser.newPage({viewport:{width:390,height:900}});await page.goto('http://127.0.0.1:4175/');
await page.locator('.menu-toggle').click();await page.waitForTimeout(400);await page.screenshot({path:'design-review/scenes/mobile-menu.png'});
await page.keyboard.press('Escape');await page.goto('http://127.0.0.1:4175/contact/');await page.locator('summary').first().click();await page.waitForTimeout(300);await page.locator('.faq-list').screenshot({path:'design-review/scenes/faq-open.png'});
await page.setViewportSize({width:1440,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4175/#about');await page.locator('.story-static').screenshot({path:'design-review/scenes/reduced-motion.png'});
// 720 CSS pixels reproduces the reflow width of a 1440px browser at 200% zoom.
await page.setViewportSize({width:720,height:450});await page.goto('http://127.0.0.1:4175/');
results.push({reflowWidth:720,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),mode:await page.locator('main').getAttribute('data-scroll-mode')});
await page.screenshot({path:'design-review/scenes/reflow-720.png'});
await writeFile('design-review/scenes/results.json',JSON.stringify(results,null,2));await browser.close();console.log(results);
