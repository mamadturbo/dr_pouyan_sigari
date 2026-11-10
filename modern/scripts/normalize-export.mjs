import {readdirSync,copyFileSync,readFileSync,existsSync} from 'node:fs';
import {join,relative,dirname,basename} from 'node:path';
// Next.js Windows export issue #85374: the router requests flattened segment
// names, while the exporter can write nested directories. Add portable aliases
// to the generated output only; do not patch Next or require CDN rewrites.
export function normalizeExport(root='out'){
  let count=0;
  function flatten(dir,base){
    for(const entry of readdirSync(dir,{withFileTypes:true})){
      const source=join(dir,entry.name);
      if(entry.isDirectory()) flatten(source,base);
      else {
        const suffix=relative(base,source).split(/[\\/]/).join('.');
        const target=join(dirname(base),basename(base)+'.'+suffix);
        if(existsSync(target)&&!readFileSync(source).equals(readFileSync(target))) throw new Error('Conflicting exported segment alias: '+target);
        copyFileSync(source,target);count++;
      }
    }
  }
  function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){if(!e.isDirectory())continue;const p=join(dir,e.name);if(e.name.startsWith('__next.'))flatten(p,p);else walk(p);}}
  walk(root);return count;
}
console.log('Normalized static segment aliases:',normalizeExport());
