import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.resolve('next/package.json'))('sharp');
import {readdir} from 'node:fs/promises';
const root='qa-artifacts/responsive-implementation',dirs=await readdir(root+'/results');
const widths=[320,360,375,390,430,768,1024,1440];
const panels=[];
for(let i=0;i<widths.length;i++){
 const dir=dirs.find(d=>d.endsWith(`chromium-${widths[i]}-portrait-no-preference`)&&d.startsWith('responsive-responsive-'));
 const input=await sharp(root+'/results/'+dir+'/hero.png').resize({width:360,height:900,fit:'contain',background:'#eee'}).png().toBuffer();panels.push({input,left:(i%4)*360,top:Math.floor(i/4)*930+30});
 const label=Buffer.from(`<svg width="360" height="30"><text x="12" y="22" font-size="20">${widths[i]} px</text></svg>`);panels.push({input:label,left:(i%4)*360,top:Math.floor(i/4)*930});
}
await sharp({create:{width:1440,height:1860,channels:3,background:'#eee'}}).composite(panels).png().toFile(root+'/hero-contact-sheet.png');
for(const width of [320,390,768,1024]){
 const dir=dirs.find(d=>d.endsWith(`chromium-${width}-portrait-no-preference`)&&d.startsWith('responsive-responsive-'));
 await sharp(root+'/results/'+dir+'/full-page.png').resize({width:Math.min(width,500)}).png().toFile(`${root}/review-full-${width}.png`);
}
