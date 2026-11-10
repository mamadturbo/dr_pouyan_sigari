import {readFileSync,existsSync,readdirSync,statSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
function findRoutes(dir='out',prefix=''){return readdirSync(dir).flatMap(name=>{const path=join(dir,name);if(statSync(path).isDirectory()&&!name.startsWith('_')&&name!=='404')return findRoutes(path,prefix+name+'/');return name==='index.html'?[prefix.replace(/\/$/,'')]:[];});}
const routes=findRoutes();
for(const route of ['','about','expertise','publications','contact','gallery','patient-guide','blog','privacy','terms','expertise/oral-maxillofacial','expertise/dental-implants','expertise/orthognathic','blog/finding-research'])if(!routes.includes(route))throw new Error('Missing public route '+route);
if(existsSync('out/blog/first-consultation/index.html'))throw new Error('Draft article was exported');
for(const route of routes){
  const path=join('out',route,'index.html');
  if(!existsSync(path)) throw new Error('Missing exported route '+route);
  const html=readFileSync(path,'utf8');
  for(const pattern of [/<html[^>]*lang="fa"/,/dir="rtl"/,/<h1[ >]/,/<meta name="description"/,/<main/]) if(!pattern.test(html)) throw new Error('Missing HTML semantics/SEO on '+route+': '+pattern);
  if(process.env.SITE_URL&&!html.includes('rel="canonical"')) throw new Error('Missing canonical on '+route);
}
for(const name of ['sitemap.xml','robots.txt','404.html']) if(!existsSync('out/'+name)) throw new Error('Missing '+name);
for(const route of routes){
  const html=readFileSync(join('out',route,'index.html'),'utf8');
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length) throw new Error('Duplicate IDs on '+route);
  for(const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)){
    const url=match[1];if(!url.startsWith('/')&&!url.startsWith('#'))continue;
    const [path,hash]=url.split('#');
    const asset=path?join('out',decodeURIComponent(path)):join('out',route,'index.html');
    const target=existsSync(asset)&&statSync(asset).isDirectory()?join(asset,'index.html'):asset;
    if(!existsSync(target))throw new Error('Broken local reference on '+route+': '+url);
    if(hash&&target.endsWith('.html')&&!readFileSync(target,'utf8').includes('id="'+hash+'"'))throw new Error('Missing anchor on '+route+': '+url);
  }
}
if(!readFileSync('out/publications/index.html','utf8').includes('درمان شکستگی استخوان بینی')) throw new Error('Research must be present without JS');
function size(dir){return readdirSync(dir).reduce((total,name)=>{const p=join(dir,name);return total+(statSync(p).isDirectory()?size(p):statSync(p).size);},0);}
const metrics={routes:routes.length,staticBytes:size('out'),javascriptBytes:size('out/_next/static/chunks'),publicAssetBytes:size('public/assets')};
writeFileSync('export-metrics.json',JSON.stringify(metrics,null,2)+'\n');console.log('Static export checks passed:',metrics);
