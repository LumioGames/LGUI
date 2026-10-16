import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';

const here=path.dirname(fileURLToPath(import.meta.url));
const [w='486',h='727',id='ring-1']=process.argv.slice(2);
const width=Number(w),height=Number(h);
if(!Number.isInteger(width)||!Number.isInteger(height)||width<320||width>3840||height<500||height>2160||!/^[A-Za-z0-9-]+$/.test(id))throw Error('Usage: capture-window.mjs width height item-id');
const out=path.join(here,'evidence',`window-${width}x${height}-${new Date().toISOString().replaceAll(':','-')}`);
await fs.mkdir(out,{recursive:true});
const {chromium}=createRequire(path.resolve(here,'../../../package.json'))('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report={viewport:{width,height},itemId:id,scope:'Isolated real Chrome at the current IAB viewport dimensions; does not inspect or mutate the IAB session.',errors:[],status:'running'};
try{
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 page.on('pageerror',error=>report.errors.push(String(error)));
 page.on('console',message=>{if(message.type()==='error')report.errors.push(message.text());});
 await page.goto('http://127.0.0.1:4182/fidelity/');
 await page.waitForFunction(()=>window.complexVerification?.ready===true);
 await page.locator(`[data-item-id="${id}"]`).click();
 await page.waitForFunction(expected=>JSON.parse(window.complexVerification.snapshot().rawTsResponse).view.selectedId===expected,id);
 await page.screenshot({path:path.join(out,`${id}.png`)});
 report.snapshot=await page.evaluate(()=>window.complexVerification.snapshot());
 report.source=await Promise.all(['fidelity.js','app.js','skin-manifest.json','detail-icons.json'].map(async file=>{const bytes=await fs.readFile(path.join(here,file));return{file,sha256:createHash('sha256').update(bytes).digest('hex')};}));
 report.status=report.errors.length||report.snapshot.errors.length?'errors':'captured';
}catch(error){report.status='failed';report.error=String(error);}
finally{await browser.close();}
await fs.writeFile(path.join(out,'result.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({status:report.status,out,viewport:report.viewport,mode:report.snapshot?.ui.fidelity.mode,scale:report.snapshot?.ui.fidelity.scale,errors:report.errors,error:report.error}));
if(report.status!=='captured')process.exitCode=1;
