import {chromium} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const folder='../research/evidence/site-update';await mkdir(folder,{recursive:true});
const papers=JSON.parse(await readFile('../research/publications.json','utf8')).filter(p=>p.attribution_status==='تأییدشده');
for(const route of ['','about','expertise','publications','contact']){
 const html=await readFile('out/'+(route?route+'/':'')+'index.html','utf8');
 assert.doesNotMatch(html,/source-checked|legacy-source|نیازمند تأیید|نیازمند بازبینی|P2013-candidate|source_ids/);
}
const browser=await chromium.launch({channel:'chrome'});const results=[];
for(const [width,height] of [[390,844],[1440,900],[805,646]]){
 const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['/','/about/','/expertise/','/publications/','/contact/']){
  assert.equal((await page.goto('http://127.0.0.1:4175'+route)).status(),200);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);
  const audit=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,lang:document.documentElement.lang,dir:document.documentElement.dir,title:document.title,description:document.querySelector('meta[name=description]')?.content,robots:document.querySelector('meta[name=robots]')?.content,canonical:!!document.querySelector('link[rel=canonical]'),text:document.body.innerText,jsonld:[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent)),phones:[...document.querySelectorAll('a[href^="tel:"]')].map(a=>a.getAttribute('href'))}));
  assert.equal(audit.overflow,false);assert.equal(audit.lang,'fa');assert.equal(audit.dir,'rtl');assert.ok(audit.description);assert.ok(audit.robots.includes('noindex'));assert.equal(audit.canonical,false);
  assert.doesNotMatch(audit.text,/نیازمند (تأیید|بازبینی)|یافت[‌ ]نشد|S0[1-9]|P2013|legacy-source|source-checked|رتبهٔ? برتر|تضمین نتیجه/);
  assert.doesNotMatch(JSON.stringify(audit.jsonld),/instagram|openingHours|aggregateRating|reviewRating|award|geo|worksFor|alumniOf|doctor-hero/);
  for(const phone of audit.phones)assert.equal(phone,'tel:+984533235000');
  if(route==='/publications/'){
   assert.equal(await page.locator('.research-card').count(),3);
   for(const paper of papers){const card=page.locator('.research-card').filter({has:page.getByText(paper.title,{exact:true})});assert.equal(await card.locator('.publication-authors').innerText(),paper.authors.join('; '));assert.equal(await card.locator('.publication-authors').getAttribute('dir'),'ltr');assert.equal(await card.locator('a').first().getAttribute('href'),paper.publisher_url);assert.ok((await card.locator('.publication-citation').innerText()).includes(paper.pages));assert.equal(await card.locator('time').getAttribute('datetime'),paper.publication_date);}
  }
  if(route==='/about/')assert.equal(await page.locator('.timeline li').count(),8);
  const name=route==='/'?'home':route.replaceAll('/','');await page.screenshot({path:`${folder}/${name}-${width}.png`,fullPage:true});
  delete audit.text;results.push({route,width,height,...audit,errors:[...errors]});assert.deepEqual(errors,[]);
 }
 if(width===805){await page.goto('http://127.0.0.1:4175/');await page.waitForTimeout(600);assert.equal(await page.locator('main').getAttribute('data-scroll-mode'),'fullpage');for(const [index,name] of [[2,'experience'],[3,'expertise'],[5,'research'],[7,'contact']]){await page.locator('.presentation-navigation button').nth(index).click();await page.waitForTimeout(800);await page.screenshot({path:`${folder}/home-${name}-${width}.png`});}}
 await page.close();
}
await browser.close();await writeFile(`${folder}/browser-review.json`,JSON.stringify(results,null,2));console.log(`Content, RTL, bibliography, SEO, JSON-LD and overflow checks passed for ${results.length} route/viewport combinations.`);
