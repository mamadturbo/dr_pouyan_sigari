import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const root='qa-artifacts/responsive-implementation';
const results=join(root,'results');
const summary=[];const routes=[];const images=[];
for(const dir of await readdir(results)){
 for(const name of await readdir(join(results,dir)).catch(()=>[])){
  if(name==='observations.json')summary.push({project:dir,...JSON.parse(await readFile(join(results,dir,name),'utf8'))});
  if(name==='routes-axe.json')routes.push({project:dir,routes:JSON.parse(await readFile(join(results,dir,name),'utf8'))});
  if(name.endsWith('.png'))images.push({project:dir,path:`results/${dir}/${name}`,name});
 }
}
await writeFile(join(root,'summary.json'),JSON.stringify({cases:summary.length,phoneCases:summary.filter(r=>r.phone).length,phoneMediaRequests:summary.filter(r=>r.phone).flatMap(r=>r.media),overflowCases:summary.filter(r=>r.overflow),consoleErrors:summary.flatMap(r=>r.errors),accessibility:summary.map(r=>({project:r.project,violations:r.violations})),routes},null,2));
const sections=images.map(r=>`<article><h2>${r.project} — ${r.name}</h2><a href="${r.path}"><img loading="lazy" src="${r.path}" alt="${r.project} ${r.name}" /></a></article>`).join('');
await writeFile(join(root,'screenshots.html'),`<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>شواهد ریسپانسیو سایت دکتر سیگاری</title><style>body{font:16px Tahoma;margin:24px;background:#f8fbfa;color:#004d3e}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}article{min-width:0;background:white;padding:12px;border:1px solid #d3e2dc;border-radius:12px}h2{font-size:12px;overflow-wrap:anywhere;direction:ltr}img{max-width:100%;max-height:700px;object-fit:contain;object-position:top}</style><h1>شواهد تصویری نسخهٔ ریسپانسیو</h1><p>برای دیدن اندازهٔ اصلی روی تصویر کلیک کنید. تصاویر عمودی، افقی، حالت کاهش حرکت، منو و مسیرهای داخلی هر دو موتور ثبت شده‌اند.</p><main>${sections}</main></html>`);
console.log(JSON.stringify({cases:summary.length,screenshots:images.length,phoneMediaRequests:summary.filter(r=>r.phone).flatMap(r=>r.media).length,overflow:summary.filter(r=>r.overflow).length,consoleErrors:summary.flatMap(r=>r.errors).length}));
