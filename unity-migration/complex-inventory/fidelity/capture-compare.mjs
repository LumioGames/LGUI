import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(path.resolve(root,'../../package.json'));
const {chromium}=require('playwright');
const sharp=createRequire(path.resolve(root,'../../toolchain-test/package.json'))('sharp');
const output=path.join(root,'fidelity/evidence');await fs.mkdir(output,{recursive:true});
const stamp=new Date().toISOString().replaceAll(':','-');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1586,height:992},deviceScaleFactor:1});
const report={timestamp:new Date().toISOString(),reference:{file:'art/reference.png',width:1586,height:992},browser:browser.version(),errors:[],requests:[],status:'running'};
page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});page.on('response',r=>report.requests.push({url:r.url(),status:r.status()}));
try{
 await page.goto('http://127.0.0.1:4182/fidelity/');
 await page.waitForFunction(()=>window.complexVerification?.ready,{},{timeout:30000});
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(700);
 report.snapshot=await page.evaluate(()=>window.complexVerification.snapshot());
 report.dom={stages:await page.locator('.fgui-stage').count(),canvas:await page.locator('canvas').count(),iframes:await page.locator('iframe').count(),inputs:await page.locator('input').count()};
 const actualPath=path.join(output,'actual-'+stamp+'.png');await page.screenshot({path:actualPath});report.actual=actualPath;
 await fs.copyFile(actualPath,path.join(output,'actual-latest.png'));
 const reference=await sharp(path.join(root,'art/reference.png')).removeAlpha().raw().toBuffer();
 const actual=await sharp(actualPath).removeAlpha().raw().toBuffer();
 if(actual.length!==reference.length)throw Error('Canonical comparison dimensions differ');
 const regions={whole:[0,0,1586,992],header:[130,12,1320,122],grid:[132,138,875,722],detail:[1016,138,433,722],footer:[132,870,1316,105]};
 const overlay=Buffer.alloc(reference.length),diff=Buffer.alloc(reference.length);let sum=0,within=0;
 for(let i=0;i<reference.length;i+=3){let max=0;for(let c=0;c<3;c++){const d=Math.abs(reference[i+c]-actual[i+c]);overlay[i+c]=Math.round((reference[i+c]+actual[i+c])/2);diff[i+c]=Math.min(255,d*4);sum+=d;max=Math.max(max,d);}if(max<=12)within++;}
 report.pixelComparison={meanAbsoluteChannelError:sum/reference.length,pixelsWithin12PerChannel:within/(1586*992),claim:'Descriptive diagnostic only. A metric threshold alone does not establish visual fidelity.'};
 report.regions={};
 for(const [name,[x,y,w,h]]of Object.entries(regions)){let error=0,close=0;for(let row=y;row<y+h;row++)for(let col=x;col<x+w;col++){const p=(row*1586+col)*3;let max=0;for(let c=0;c<3;c++){const d=Math.abs(reference[p+c]-actual[p+c]);error+=d;max=Math.max(max,d);}if(max<=12)close++;}report.regions[name]={rect:[x,y,w,h],mae:error/(w*h*3),pixelsWithin12:close/(w*h)};}
 await sharp(overlay,{raw:{width:1586,height:992,channels:3}}).png().toFile(path.join(output,'overlay-'+stamp+'.png'));
 await sharp(diff,{raw:{width:1586,height:992,channels:3}}).png().toFile(path.join(output,'difference-'+stamp+'.png'));
 report.status=report.errors.length===0&&report.requests.every(r=>r.status<400)?'captured':'runtime-errors';
}catch(error){report.status='failed';report.failure={message:String(error),stack:error.stack};}
await browser.close();await fs.writeFile(path.join(output,'comparison-'+stamp+'.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,actual:report.actual,pixelComparison:report.pixelComparison,regions:report.regions,errors:report.errors,failure:report.failure},null,2));if(report.status!=='captured')process.exitCode=1;
