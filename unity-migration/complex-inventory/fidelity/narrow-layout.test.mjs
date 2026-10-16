import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const here=path.dirname(fileURLToPath(import.meta.url)),{chromium}=createRequire(path.resolve(here,'../../../package.json'))('playwright');
const out=path.join(here,'evidence','narrow-layout-'+new Date().toISOString().replaceAll(':','-'));await fs.mkdir(out,{recursive:true});
const report={status:'running',checks:[],errors:[],screenshots:[]},browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:486,height:727},deviceScaleFactor:1});page.on('pageerror',e=>report.errors.push(String(e)));
const check=(name,passed,actual)=>{report.checks.push({name,passed:!!passed,actual});assert.ok(passed,name+' '+JSON.stringify(actual));};
const read=()=>page.evaluate(()=>window.complexVerification.snapshot());
const paint=async file=>{const full=path.join(out,file);await page.screenshot({path:full});report.screenshots.push(full);};
const inViewport=(r,w,h)=>r.x>=-.5&&r.y>=-.5&&r.x+r.width<=w+.5&&r.y+r.height<=h+.5;
const textBox=async id=>page.locator('[data-testid="'+id+'"]').evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);return{text:el.textContent,font:parseFloat(getComputedStyle(el).fontSize),box:el.getBoundingClientRect().toJSON(),ink:range.getBoundingClientRect().toJSON()};});
try{
 await page.goto('http://127.0.0.1:4182/fidelity/');await page.waitForFunction(()=>window.complexVerification?.ready);
 for(const [width,height] of [[486,727],[390,844]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(80);let s=await read();await paint(width+'-sword.png');
  check(width+' viewport uses native adaptive scale',s.ui.fidelity.mode==='adaptive'&&s.ui.fidelity.scale===1&&s.ui.fidelity.offsetX===0&&s.ui.fidelity.offsetY===0,s.ui.fidelity);
  check(width+' main fills current viewport',s.ui.fidelity.mainRect.width===width&&s.ui.fidelity.mainRect.height===height,s.ui.fidelity.mainRect);
  check(width+' all24 actual tiles fit',s.ui.rows.length===24&&s.ui.rows.every(row=>inViewport(row.rect,width,height)),s.ui.rows);
  const columns=width===390?2:3,lines=24/columns;
  check(width+' actual grid chooses largest proportional cells',new Set(s.ui.rows.map(row=>Math.round(row.rect.x))).size===columns&&new Set(s.ui.rows.map(row=>Math.round(row.rect.y))).size===lines,s.ui.rows);
  for(const id of ['detailTitle','rarity','description']){const t=await textBox(id);check(width+' '+id+' is readable without clipped text',t.font>=16&&t.ink.left>=t.box.left-1&&t.ink.right<=t.box.right+1&&t.ink.top>=t.box.top-1&&t.ink.bottom<=t.box.bottom+1,t);}
  const desc=await textBox('description');check(width+' description stays above actions',desc.ink.bottom<=s.ui.controlRects.primary.y,{desc,primary:s.ui.controlRects.primary});
  const qty=await page.locator('[data-testid="quantity"]').evaluateAll(elements=>elements.map(el=>({font:parseFloat(getComputedStyle(el).fontSize),rect:el.getBoundingClientRect().toJSON(),row:el.parentElement.getBoundingClientRect().toJSON()})));
  check(width+' all quantities use native16px and remain in tiles',qty.every(q=>q.font>=16&&q.rect.x>=q.row.x-.5&&q.rect.right<=q.row.right+.5&&q.rect.bottom<=q.row.bottom+.5),qty);
  await page.locator('[data-item-id="ring-1"]').click();await page.waitForTimeout(40);await paint(width+'-ring.png');
  await page.locator('[data-item-id="scroll-1"]').click();const title=await textBox('detailTitle');check(width+' six-character title is complete',title.text==='失落地图卷轴'&&title.ink.bottom<=title.box.bottom+1&&title.ink.right<=title.box.right+1,title);
  const disabled=await page.locator('[data-testid="primary-label"]').evaluate(el=>{const span=el.querySelector('.fgui-text'),range=document.createRange();range.selectNodeContents(span);return{ink:range.getBoundingClientRect().toJSON(),clip:span.getBoundingClientRect().toJSON()};});
  check(width+' four-character bold action has no actual clipping',disabled.ink.left>=disabled.clip.left-.5&&disabled.ink.right<=disabled.clip.right+.5,disabled);
  await page.locator('[data-item-id="redPotion-1"]').click();await page.locator('[data-testid="sell"]').click();s=await read();
  check(width+' confirmation buttons are in viewport',['confirm','cancel'].every(id=>inViewport(s.ui.controlRects[id],width,height)),s.ui.controlRects);
  await page.locator('[data-testid="cancel"]').click();await page.locator('[data-testid="menu"]').click();await page.locator('[data-testid="menu_reward"]').click();s=await read();
  check(width+' all reward popup buttons are in viewport',['confirm','cancel','reward-progress','reward-claim'].every(id=>inViewport(s.ui.controlRects[id],width,height)),s.ui.controlRects);
  await page.locator('[data-testid="reward-progress"]').click();await page.locator('[data-testid="reward-claim"]').click();s=await read();const rewardBody=await textBox('popup-body');
  check(width+' reward feedback text stays above reward actions',rewardBody.ink.bottom<=s.ui.controlRects['reward-progress'].y&&rewardBody.ink.bottom<=rewardBody.box.bottom+1,{rewardBody,action:s.ui.controlRects['reward-progress']});
  await page.locator('[data-testid="confirm"]').click();await page.locator('[data-item-id="sword-1"]').click();
 }
 for(const [width,height] of [[754,743],[794,727],[1100,1100]]){await page.setViewportSize({width,height});await page.waitForTimeout(60);const s=await read();check(width+' square/tall viewport remains native adaptive',s.ui.fidelity.mode==='adaptive'&&s.ui.fidelity.scale===1,s.ui.fidelity);}
 await page.setViewportSize({width:1586,height:992});await page.waitForTimeout(60);const s=await read();check('reference viewport preserves canonical geometry',s.ui.fidelity.mode==='canonical'&&s.ui.fidelity.scale===1,s.ui.fidelity);
 check('resize kept one business subscription',s.response.session.listenerCount===1&&s.response.session.opens===1&&s.response.session.closes===0,s.response.session);
 check('no new bridge/page errors',report.errors.length===0&&s.errors.length===0,{page:report.errors,bridge:s.errors});report.status='passed';
}catch(error){report.status='failed';report.failure=String(error);await paint('failure.png');}
finally{await browser.close();}
await fs.writeFile(path.join(out,'result.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:report.checks.length,failure:report.failure,out}));if(report.status!=='passed')process.exitCode=1;
