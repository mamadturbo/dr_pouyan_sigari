import {spawnSync} from 'node:child_process';
if(!process.env.SITE_URL) throw new Error('Release blocked: set SITE_URL to the owner-approved HTTPS origin.');
await import('./validate.mjs');
const result=spawnSync(process.execPath,['node_modules/next/dist/bin/next','build','--webpack'],{stdio:'inherit',env:process.env});
if(result.status!==0) process.exit(result.status??1);
await import('./normalize-export.mjs');
await import('./check-export.mjs');
console.log('Release export prepared in out/. No deployment was performed.');
