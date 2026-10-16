import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const webRoot=path.join(root,'unity-migration/complex-inventory');
const {chromium}=createRequire(import.meta.url)('playwright');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.fui':'application/octet-stream'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
  const file=path.resolve(webRoot,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
  if(!file.startsWith(webRoot+path.sep)){res.writeHead(403).end();return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(await fs.readFile(file));
 }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:794,height:727},deviceScaleFactor:1});
 const errors=[],failedRequests=[],external=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',response=>{if(response.status()>=400)failedRequests.push({url:new URL(response.url()).pathname,status:response.status()});});
 await page.route(/^https?:/,route=>{
  if(new URL(route.request().url()).origin!==origin){external.push(route.request().url());return route.abort();}
  return route.continue();
 });
 const check=(name,condition)=>{assert(condition,name);checks.push({name,passed:true});};
 await page.goto(origin+'/fidelity/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>globalThis.complexVerification?.ready);
 const read=()=>page.evaluate(()=>globalThis.complexVerification.snapshot());
 let state=await read();
 check('public snapshot loads 24 real slots',state.response.view.usedSlots===24&&state.ui.physicalRows===24);
 check('initial wallet and selection match fixture',state.response.view.coins===12480&&state.response.view.selectedId==='sword-1');
 check('794 window uses four-column adaptive layout',state.ui.fidelity.columns===4&&state.ui.fidelity.mode==='adaptive');
 await page.getByTestId('primary').click();
 await page.waitForFunction(()=>globalThis.complexVerification.snapshot().response.view.equipment.weapon?.id==='sword-1');
 check('real primary button equips through shared business',true);
 await page.getByTestId('primary').click();
 await page.waitForFunction(()=>globalThis.complexVerification.snapshot().response.view.equipment.weapon===null);
 check('real primary button unequips through shared business',true);
 await page.setViewportSize({width:390,height:844});
 await page.waitForFunction(()=>globalThis.complexVerification.snapshot().ui.screenWidth===390);
 state=await read();check('390 window uses two-column native-scale adaptive layout',state.ui.fidelity.columns===2&&state.ui.fidelity.scale===1);
 await page.getByRole('textbox',{name:'搜索物品'}).fill('药水');
 await page.waitForFunction(()=>globalThis.complexVerification.snapshot().response.view.query==='药水');
 state=await read();check('actual input updates shared Chinese search',state.response.view.visible.length===3);
 check('local resource requests succeed without page errors',!errors.length&&!failedRequests.length&&!external.length);
 const result={schemaVersion:1,status:'passed',scope:'Public repository snapshot: isolated headless Chrome DOM smoke only, not Unity or physical IME',node:process.version,checks,errors,failedRequests,externalRequests:external};
 await fs.writeFile(path.join(root,'evidence/publication-web-smoke.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result));
}finally{
 if(browser)await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
