import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome'});
const page=await browser.newPage();
for(const [width,height] of [[805,646],[845,646],[1280,720],[1366,768],[1440,900]]){
 await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4175/');await page.waitForTimeout(900);
 console.log(width,height,await page.evaluate(()=>{
  const shell=document.querySelector('#page-shell');
  const footer=shell.querySelector('.site-footer');
  shell.style.setProperty('--home-footer-height',`${footer.offsetHeight}px`);
  shell.classList.add('presentation-candidate');
  return Array.from(document.querySelectorAll('main>section')).map(panel=>{
   const bounds=panel.getBoundingClientRect();
   return {id:panel.id,height:bounds.height,footer:panel.id==='contact'?footer.offsetHeight:0,
    overflow:Array.from(panel.querySelectorAll('.container,.story-state')).flatMap(node=>{
     if(!node.getClientRects().length)return [];
     const box=node.getBoundingClientRect();const clip=node.classList.contains('story-state')?node.closest('.story-card').getBoundingClientRect():bounds;
     return box.top<clip.top-2||box.bottom>clip.bottom+2?[{class:node.className,top:box.top-clip.top,bottom:box.bottom-clip.bottom}]:[];
    })};
  });
 }));
}
await browser.close();
