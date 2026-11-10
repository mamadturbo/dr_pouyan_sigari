import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
const results=[];
for(const mode of ['mobile','desktop']){
  const output=`lighthouse-final-${mode}.json`;
  const args=['node_modules/lighthouse/cli/index.js','http://127.0.0.1:4175/','--chrome-flags=--headless --no-sandbox','--only-categories=performance,accessibility,best-practices,seo','--output=json',`--output-path=./${output}`,'--quiet'];
  if(mode==='desktop')args.push('--preset=desktop');
  const run=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});
  if(run.status!==0)process.exit(run.status??1);
  const report=JSON.parse(readFileSync(output,'utf8'));
  const result={mode,measuredAt:report.fetchTime,chrome:report.environment.hostUserAgent,lighthouseVersion:report.lighthouseVersion,
    scores:Object.fromEntries(Object.entries(report.categories).map(([key,value])=>[key,value.score*100])),
    lcpMs:report.audits['largest-contentful-paint'].numericValue,cls:report.audits['cumulative-layout-shift'].numericValue,
    tbtMs:report.audits['total-blocking-time'].numericValue,inp:null,
    transferredBytes:report.audits['total-byte-weight'].numericValue,
    transferredJavascriptBytes:report.audits['network-requests'].details.items.filter(item=>item.resourceType==='Script').reduce((sum,item)=>sum+item.transferSize,0),
    warnings:report.runWarnings};
  results.push(result);console.log(result);
}
writeFileSync('performance-results.json',JSON.stringify({method:'Single local Lighthouse 13 lab run per mode, gzip-enabled static preview, no production CDN or field INP data.',results},null,2)+'\n');
