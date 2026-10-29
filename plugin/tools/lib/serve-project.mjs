import fs from 'node:fs';import path from 'node:path';import http from 'node:http';
import {contained} from './paths.mjs';
export function serveProject(workspace,config,port){
 const root=contained(workspace,config.web?.root);
 if(!fs.statSync(root).isDirectory())throw Error('Configured web.root is not a directory.');
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.fui':'application/octet-stream'};
 const server=http.createServer((request,response)=>{
  try{
   const url=new URL(request.url,'http://localhost');let name=decodeURIComponent(url.pathname).slice(1);
   if(!name||name.endsWith('/'))name+='index.html';
   const file=contained(root,name);
   if(!fs.statSync(file).isFile()){response.writeHead(404).end();return;}
   response.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(response);
  }catch{response.writeHead(404).end();}
 });
 server.on('error',error=>{console.error(error.message);process.exitCode=1;});
 server.listen(port,'127.0.0.1',()=>console.log(`LGUI http://127.0.0.1:${port}${config.web.path||'/'}`));
 return server;
}
