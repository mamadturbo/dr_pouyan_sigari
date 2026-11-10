import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'});
const observations=[];
for(const width of [320,390,768,1024,1440]){
 const page=await browser.newPage({viewport:{width,height:900}});
 const requests=[];page.on('request',r=>{if(/story-|doctor-turn/.test(r.url()))requests.push(r.url())});
 await page.goto('http://127.0.0.1:4175/');await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:`qa-artifacts/responsive-implementation/before-${width}.png`,fullPage:true});
 observations.push({width,requests,layout:await page.evaluate(()=>({scrollMode:document.querySelector('main').dataset.scrollMode,width:document.documentElement.scrollWidth,hero:document.querySelector('.hero-reference').getBoundingClientRect().toJSON()}))});
 await page.close();
}
await writeFile('qa-artifacts/responsive-implementation/before.json',JSON.stringify(observations,null,2));await browser.close();
