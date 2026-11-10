import {chromium} from '@playwright/test';
import {mkdtemp,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
// Isolated disposable Chrome profile; never touches the user's browser profile.
const profile=await mkdtemp(join(tmpdir(),'sigari-zoom-'));
const context=await chromium.launchPersistentContext(profile,{channel:'chrome',headless:true,viewport:null,args:['--window-size=1440,900']});
const page=context.pages()[0];const result=[];
await page.goto('chrome://settings/appearance');
await page.locator('select').first().waitFor();
await page.locator('#zoomLevel').selectOption({label:'200%'});
for(const route of ['/','/about/','/expertise/','/publications/','/blog/','/blog/first-consultation/','/blog/finding-research/','/contact/','/404.html']){
 await page.goto('http://127.0.0.1:4175'+route);await page.waitForTimeout(300);
 result.push({route,...await page.evaluate(()=>({width:innerWidth,dpr:devicePixelRatio,overflow:document.documentElement.scrollWidth>innerWidth,mode:document.querySelector('main')?.dataset.scrollMode,h1:!!document.querySelector('h1')?.getClientRects().length}))});
}
await page.screenshot({path:'design-review/scenes/zoom-200.png'});
await writeFile('design-review/zoom-results.json',JSON.stringify(result,null,2));
await context.close();console.log(result);
if(result.some(r=>r.width>800||r.dpr<1.9||r.overflow||!r.h1))process.exitCode=1;
