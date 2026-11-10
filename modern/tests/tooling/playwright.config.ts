import {defineConfig} from '@playwright/test';
const widths=[320,360,375,390,430,768,1024,1440];
const viewports=[...widths.map(width=>({name:`${width}-portrait`,width,height:width===768?1024:900,touch:width<=1024})),...widths.filter(w=>w<=430).map(height=>({name:`${height}-landscape`,width:844,height,touch:true}))];
export default defineConfig({
 testDir:'.',outputDir:'../../qa-artifacts/responsive-implementation/results',workers:2,timeout:60000,
 reporter:[['list'],['html',{outputFolder:'../../qa-artifacts/responsive-implementation/report',open:'never'}]],
 use:{baseURL:process.env.TOOLING_BASE_URL||'http://127.0.0.1:4185',trace:'retain-on-failure'},
 webServer:process.env.TOOLING_BASE_URL?undefined:{command:'node scripts/serve.mjs',cwd:'../..',env:{PORT:'4185'},url:'http://127.0.0.1:4185',reuseExistingServer:false},
 projects:[...(['chromium','webkit'] as const).flatMap(browserName=>viewports.flatMap(v=>(['no-preference','reduce'] as const).map(reducedMotion=>({
 name:`${browserName}-${v.name}-${reducedMotion}`,testMatch:'responsive.spec.ts',use:{browserName,...(browserName==='chromium'?{channel:'chrome'}:{}),viewport:{width:v.width,height:v.height},hasTouch:v.touch,isMobile:v.touch,reducedMotion}
 })))),...(['chromium','webkit'] as const).map(browserName=>({name:`engine-${browserName}`,testMatch:'installation.spec.ts',use:{browserName}}))]
});
