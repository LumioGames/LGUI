import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const root=path.dirname(fileURLToPath(import.meta.url));
const {chromium}=createRequire(path.resolve(root,'../../../package.json'))('playwright');
const stamp=new Date().toISOString().replaceAll(':','-'),out=path.join(root,'evidence','adaptive-'+stamp);await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:754,height:743},deviceScaleFactor:1});
const report={viewport:{width:754,height:743},checks:[],errors:[],screenshots:[],status:'running'};
page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
const check=(name,ok)=>{report.checks.push({name,passed:!!ok});assert.ok(ok,name);};
try{
 await page.goto('http://127.0.0.1:4182/fidelity/');await page.waitForFunction(()=>window.complexVerification?.ready);await page.waitForTimeout(350);
 const read=()=>page.evaluate(()=>window.complexVerification.snapshot());
 let s=await read();report.initial=s;
 check('24 visible responsive items',s.ui.rows.length===24);
 check('responsive UI uses native scale',s.ui.fidelity.scale===1);
 const c=s.ui.controls.find(c=>c.name==='description');check('readable detail width',c.rect.width>=260);
 const effective=await page.locator('[data-testid="description"]').evaluate(el=>({font:getComputedStyle(el.querySelector('.fgui-text')||el).fontSize,rect:el.getBoundingClientRect().toJSON()}));report.description=effective;
 check('body font at least16px',parseFloat(effective.font)>=16);
 for(const id of ['sword-1','key-1','redPotion-1']){
  await page.locator('[data-item-id="'+id+'"]').click();await page.waitForTimeout(120);s=await read();check('actual selection '+id,JSON.parse(s.rawTsResponse).view.selectedId===id);
  const file=path.join(out,id+'.png');await page.screenshot({path:file});report.screenshots.push({id,file});
 }
 await page.locator('[data-testid="primary"]').click();await page.waitForTimeout(100);s=await read();check('use shows live quantity7',JSON.parse(s.rawTsResponse).view.selected.quantity===7);
 await page.screenshot({path:path.join(out,'redPotion-used.png')});
 check('no unexplained errors',report.errors.length===0&&s.errors.length===0);report.status='passed';report.final=s;
}catch(error){report.status='failed';report.failure={message:String(error),stack:error.stack};await page.screenshot({path:path.join(out,'failure.png')});}
finally{await browser.close();}
await fs.writeFile(path.join(out,'result.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:report.checks,failure:report.failure,screenshots:report.screenshots,out},null,2));if(report.status!=='passed')process.exitCode=1;
