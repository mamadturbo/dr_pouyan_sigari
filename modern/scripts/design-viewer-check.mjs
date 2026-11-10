import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4177/');
for(const width of ['1440','805','768','390']){
 await page.locator('#width').selectOption(width);
 for(const route of await page.locator('#route option').evaluateAll(options=>options.map(o=>o.value))){
  await page.locator('#route').selectOption(route);
  for(const phase of ['before','after'])await expect.poll(()=>page.locator('#'+phase).evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
 }
}
await page.locator('#route').selectOption('expertise');await page.locator('#width').selectOption('1440');
await expect(page.locator('#caption')).toContainText('1440');
await page.screenshot({path:'design-review/comparison-viewer.png',fullPage:true});
for(const path of ['/DESIGN.md','/VALIDATION.md'])expect((await page.request.get('http://127.0.0.1:4177'+path)).status()).toBe(200);
expect(errors).toEqual([]);console.log('36 before/after comparisons load; documentation links resolve; no page errors.');
await browser.close();
