import {createServer} from 'node:http';
import {existsSync,createReadStream,statSync,readFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {resolve,extname} from 'node:path';
const root=resolve(process.env.STATIC_DIR||'out');const port=Number(process.env.PORT||4175);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.txt':'text/plain; charset=utf-8','.xml':'application/xml','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.mp4':'video/mp4'};
createServer((req,res)=>{
  let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  let file=resolve(root,'.'+name);if(file!==root&&!file.startsWith(root+'/')&&!file.startsWith(root+'\\')){res.writeHead(403).end();return;}
  if(existsSync(file)&&statSync(file).isDirectory()) file=resolve(file,'index.html');
  let status=200;if(!existsSync(file)){file=resolve(root,'404.html');status=404;}
  if(!existsSync(file)){res.writeHead(503).end('Build first');return;}
  const size=statSync(file).size;const headers={'Content-Type':mime[extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff','Vary':'Accept-Encoding','Cache-Control':name.startsWith('/_next/static/')?'public, max-age=31536000, immutable':name.startsWith('/assets/')?'public, max-age=3600':'no-cache'};
  if(/\.(html|js|css|txt|xml|svg)$/.test(file)&&req.headers['accept-encoding']?.includes('gzip')){
    const compressed=gzipSync(readFileSync(file));res.writeHead(status,{...headers,'Content-Encoding':'gzip','Content-Length':compressed.length});res.end(req.method==='HEAD'?undefined:compressed);return;
  }
  const match=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  if(match&&status===200){const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),size-1):size-1;if(start> end||start>=size){res.writeHead(416,{'Content-Range':'bytes */'+size}).end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});createReadStream(file,{start,end}).pipe(res);}
  else {res.writeHead(status,{...headers,'Content-Length':size});if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);}
}).listen(port,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+port));
