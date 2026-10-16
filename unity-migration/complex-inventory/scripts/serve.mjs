import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'), port=4182;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.fui':'application/octet-stream'};
http.createServer((req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
  const route=pathname==='/'?'/web/index.html':pathname.endsWith('/')?pathname+'index.html':pathname;
  const file=path.resolve(root,'.'+route);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  const bytes=fs.readFileSync(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
 }catch(error){res.writeHead(404).end('not found');}
}).listen(port,'127.0.0.1',()=>console.log(JSON.stringify({pid:process.pid,url:'http://127.0.0.1:'+port+'/web/',root})));
