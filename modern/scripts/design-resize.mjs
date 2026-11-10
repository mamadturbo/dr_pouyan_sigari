import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome'});const page=await browser.newPage();
await page.setViewportSize({width:1280,height:720});await page.goto('http://127.0.0.1:4175/#services');await page.waitForTimeout(1000);
await page.mouse.move(900,400);await page.mouse.wheel(0,120);await page.waitForTimeout(1300);
for(const [width,height] of [[1280,720],[805,646],[1280,720]]){
 await page.setViewportSize({width,height});await page.waitForTimeout(1200);
 console.log(width,await page.evaluate(()=>({mode:document.querySelector('main').dataset.scrollMode,hash:location.hash,scrollY,scrollTop:document.querySelector('#page-shell').scrollTop,current:document.querySelector('#page-shell').dataset.currentSection,panels:[...document.querySelectorAll('main>section')].map(n=>({id:n.id,height:n.offsetHeight,y:n.getBoundingClientRect().y})),timeline:[...document.querySelectorAll('.timeline li')].map(n=>({height:n.offsetHeight,title:n.querySelector('h3').offsetHeight,year:n.querySelector('.timeline-year').offsetHeight}))})));
 await page.screenshot({path:`design-review/resize-${width}.png`});
}
await browser.close();
