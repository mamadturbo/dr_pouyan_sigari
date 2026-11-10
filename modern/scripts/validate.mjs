import {readFileSync,readdirSync} from 'node:fs';
import {articleSchema} from '../src/lib/schemas.ts';
for(const name of ['package-lock.json','yarn.lock','bun.lock','bun.lockb'])if(readdirSync('.').includes(name))throw new Error('Use only pnpm-lock.yaml; unexpected lockfile: '+name);
if(process.env.SITE_URL){
  const url=new URL(process.env.SITE_URL);
  if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash) throw new Error('SITE_URL must be an HTTPS origin without credentials, path, query or fragment');
}else console.warn('Preview build: no SITE_URL. Crawling is blocked and canonical URLs omitted. Use pnpm release for deployment.');
const slugs=[];
for(const file of readdirSync('src/content/blog').filter(f=>f.endsWith('.mdx'))){
  const source=readFileSync('src/content/blog/'+file,'utf8');
  const match=source.match(/^export const article = (\{[\s\S]*?\n\});/);
  if(!match) throw new Error('Use a JSON object exported as article: '+file);
  const metadata=articleSchema.parse(JSON.parse(match[1]));
  if(file!==metadata.slug+'.mdx') throw new Error('Filename and slug differ: '+file);
  for(const heading of metadata.toc){if(!source.includes('id="'+heading.id+'"')) throw new Error('Missing TOC heading '+heading.id);}
  slugs.push(metadata.slug);
}
if(new Set(slugs).size!==slugs.length) throw new Error('Duplicate slugs');
console.log('Validated article metadata, TOC anchors and site origin.');
