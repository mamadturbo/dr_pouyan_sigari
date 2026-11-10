import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {homeSections} from '../src/lib/home-sections.ts';
await mkdir('design-review/comments',{recursive:true});
const browser=await chromium.launch({channel:'chrome'});const results=[];
for(const width of [390,768,861,1440]){
 const page=await browser.newPage({viewport:{width,height:width===861?646:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4175/');
 if(width>768){
  await expect(page.locator('main')).toHaveAttribute('data-scroll-mode','fullpage');
  for(let index=0;index<homeSections.length;index++){
   if(index){await page.locator('.presentation-navigation button').nth(index).click();await expect(page.locator('#page-shell')).toHaveAttribute('data-current-section',String(index));await expect(page.locator('#page-shell')).toHaveAttribute('data-transitioning','false');}
   await page.screenshot({path:`design-review/comments/${homeSections[index].id}-${width}.png`});
  }
 }else{await page.locator('#journey').scrollIntoViewIfNeeded();await page.waitForTimeout(150);await page.screenshot({path:`design-review/comments/gallery-${width}.png`});}
 results.push({width,errors,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 await page.goto('http://127.0.0.1:4175/publications/');await expect(page.locator('h1')).toHaveText('پژوهش‌ها و مقالات');await page.screenshot({path:`design-review/comments/publications-${width}.png`});
 await page.close();
}
await writeFile('design-review/comments/captures.json',JSON.stringify(results,null,2));await browser.close();console.log(results);
