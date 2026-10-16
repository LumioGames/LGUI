import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';

const here=path.dirname(fileURLToPath(import.meta.url));
const {chromium}=createRequire(path.resolve(here,'../../../package.json'))('playwright');
const manifest=JSON.parse(await fs.readFile(path.join(here,'skin-manifest.json'),'utf8'));
const out=path.join(here,'evidence','button-skins-'+new Date().toISOString().replaceAll(':','-'));
await fs.mkdir(out,{recursive:true});
const report={status:'running',checks:[],errors:[],screenshots:[]};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:754,height:743},deviceScaleFactor:1});
page.on('pageerror',e=>report.errors.push(String(e)));
const check=(name,condition,actual)=>{report.checks.push({name,passed:!!condition,actual});assert.ok(condition,name+' '+JSON.stringify(actual));};
try{
  await page.goto('http://127.0.0.1:4182/fidelity/');
  await page.waitForFunction(()=>window.complexVerification?.ready);
  for(const [width,height] of [[754,743],[794,727]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(80);
    const file=path.join(out,width+'.png');await page.screenshot({path:file});report.screenshots.push(file);
    for(const [testid,key] of [['searchBg','searchBg'],['tab-skin','tabSelectedBg'],['primary-skin','primaryBg'],['sell-skin','secondaryBg']]){
      const locator=testid==='tab-skin'?page.locator('[data-testid="tab_all"] [data-testid="tab-skin"]'):page.locator('[data-testid="'+testid+'"]');
      const value=await locator.evaluate(el=>({slice:getComputedStyle(el).borderImageSlice,rect:el.getBoundingClientRect().toJSON(),border:getComputedStyle(el).borderImageWidth}));
      const expected=manifest.assets[key].borderImage.slice;
      const nums=value.slice.replace('fill','').trim().split(/\s+/).map(Number);
      const expanded=nums.length===1?Array(4).fill(nums[0]):nums.length===2?[nums[0],nums[1],nums[0],nums[1]]:nums.length===3?[nums[0],nums[1],nums[2],nums[1]]:nums;
      check(width+' '+key+' keeps source corner slices',JSON.stringify(expanded)===JSON.stringify(expected),{actual:expanded,expected});
      check(width+' '+key+' has a positive source center',expanded[0]+expanded[2]<manifest.assets[key].height&&expanded[1]+expanded[3]<manifest.assets[key].width,{expanded});
      check(width+' '+key+' full-height background',value.rect.height>30,{height:value.rect.height});
    }
    for(const [name,icon] of [['primary','compass'],['sell','sellCoins']]){
      const group=await page.evaluate(({name,icon})=>{const rect=id=>document.querySelector('[data-testid="'+id+'"]').getBoundingClientRect().toJSON();return{button:rect(name),icon:rect(icon),label:rect(name+'-label'),source:document.querySelector('[data-testid="'+icon+'"]').dataset.skinAsset};},{name,icon});
      const center=(Math.min(group.icon.x,group.label.x)+Math.max(group.icon.right,group.label.right))/2;
      check(width+' '+name+' icon and text group centered',Math.abs(center-(group.button.x+group.button.width/2))<1,group);
      check(width+' '+name+' icon preserves aspect',Math.abs(group.icon.width/group.icon.height-manifest.assets[group.source].width/manifest.assets[group.source].height)<.01,group);
      check(width+' '+name+' ornament keeps reference height proportion',Math.abs(group.icon.height/group.button.height-(name==='primary'?39/64:33/62))<.01,group);
    }
    const snapshot=await page.evaluate(()=>window.complexVerification.snapshot());
    for(const [name,key] of [['primary','primaryBg'],['sell','secondaryBg']]){
      const button=snapshot.ui.controlRects[name],asset=manifest.assets[key];
      check(width+' '+name+' preserves reference button proportions',Math.abs(button.width/button.height-asset.width/asset.height)<.02,{button,assetRatio:asset.width/asset.height});
    }
    const description=snapshot.ui.controlRects.description,primary=snapshot.ui.controlRects.primary;
    check(width+' description does not overlap action buttons',description.y+description.height<=primary.y,{description,primary});
  }
  await page.locator('[data-item-id="key-1"]').click();
  const disabled=await page.locator('[data-testid="primary-label"]').evaluate(el=>({text:el.textContent,width:el.getBoundingClientRect().width}));
  check('four-character disabled label remains fully sized',disabled.text==='不可使用'&&disabled.width>=92,disabled);
  await page.setViewportSize({width:754,height:743});await page.locator('[data-item-id="ring-1"]').click();await page.waitForTimeout(80);
  const ring=await page.evaluate(()=>window.complexVerification.snapshot().ui.detail);
  const source=JSON.parse(await fs.readFile(path.join(here,'detail-icons.json'),'utf8')).entries.find(entry=>entry.index===8);
  check('ring uses current declared natural size',ring.naturalSize.width===source.width&&ring.naturalSize.height===source.height,{ring,source});
  check('ring renderer contains real asset without stretch',Math.abs(ring.imageRect.width/ring.imageRect.height-ring.naturalSize.width/ring.naturalSize.height)<.01,ring);
  await page.screenshot({path:path.join(out,'754-ring.png')});
  await page.locator('[data-item-id="sword-1"]').click();
  await page.setViewportSize({width:1586,height:992});await page.waitForTimeout(80);
  const state=await page.evaluate(()=>window.complexVerification.snapshot());
  check('canonical remains reference geometry',state.ui.fidelity.mode==='canonical'&&state.ui.fidelity.scale===1,state.ui.fidelity);
  check('resize preserves shared session listener',state.response.session.listenerCount===1&&state.response.session.opens===1&&state.response.session.closes===0,state.response.session);
  check('no page or bridge errors',report.errors.length===0&&state.errors.length===0,{page:report.errors,bridge:state.errors});
  await page.screenshot({path:path.join(out,'canonical.png')});
  const icons=JSON.parse(await fs.readFile(path.join(here,'detail-icons.json'),'utf8'));
  icons.entries.find(entry=>entry.index===8).file+='?manifest-driven-resource';
  await page.route('**/detail-icons.json',route=>route.fulfill({json:icons}));
  await page.goto('http://127.0.0.1:4182/fidelity/');await page.waitForFunction(()=>window.complexVerification?.ready);
  await page.locator('[data-item-id="ring-1"]').click();
  const detail=await page.evaluate(()=>window.complexVerification.snapshot().ui.detail);
  check('detail renderer consumes declared asset file',detail.url.endsWith('?manifest-driven-resource'),detail);
  report.status='passed';
}catch(error){report.status='failed';report.failure=String(error);await page.screenshot({path:path.join(out,'failure.png')});}
finally{await browser.close();}
await fs.writeFile(path.join(out,'result.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({status:report.status,checks:report.checks.length,failure:report.failure,out}));
if(report.status!=='passed')process.exitCode=1;
