import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const phase=process.argv[2]||'before';
const folder=`design-review/${phase}`;
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const routes=['/','/about/','/expertise/','/publications/','/blog/','/blog/first-consultation/','/blog/finding-research/','/contact/','/404.html'];
const results=[];
for(const width of [1440,390,768,805]){
  const page=await browser.newPage({viewport:{width,height:width===805?646:900}});
  for(const route of routes){
    const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
    await page.goto('http://127.0.0.1:4175'+route);
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(600);
    const name=route==='/'?'home':route.replaceAll('/','-').replaceAll('.html','').replace(/^-|-$/g,'');
    await page.screenshot({path:`${folder}/${name}-${width}.png`,fullPage:true});
    results.push({route,width,...await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,mode:document.querySelector('main')?.dataset.scrollMode,h1:document.querySelector('h1')?.innerText})),errors});
    page.off('pageerror',onError);
  }
  await page.close();
}
await writeFile(`${folder}/results.json`,JSON.stringify(results,null,2));
await browser.close();
console.log(JSON.stringify({phase,screenshots:results.length,issues:results.filter(r=>r.overflow||r.errors.length)}));
