import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export const EXPECTATIONS={
 identity:{attribute:'data-fidelity-page',value:'reference-v1'},
 canonical:{width:1586,height:992,deviceScaleFactor:1,columns:6,rows:4,stacks:24},
 quantities:[1,1,1,1,1,1,1,1,1,1,8,5,3,2,1,12,7,9,4,6,1,3,18,2],
 initial:{coins:12480,capacity:30,selectedId:'sword-1',category:'all',query:'',sort:'default',swordStats:{attack:48,crit:6,durability:100}},
 ui:{primary:'primary',sell:'sell',confirm:'confirm',cancel:'cancel',search:'search',sort:'sort',menu:'menu',save:'menu_save',load:'menu_load',reward:'menu_reward'},
 scope:'Playwright DOM input on an isolated local browser; not OS input, Computer Use, a mobile-device test or physical IME.',
 visualPolicy:'No pixel similarity threshold. Canonical screenshot, 1280 uniform geometry and narrow fit are separate from root reference overlays and regional human review.',
};
function loopback(value){const url=new URL(value);assert.equal(url.protocol,'http:','Only local HTTP is permitted');assert.equal(url.hostname,'127.0.0.1','Only the explicit loopback host is permitted');assert.equal(url.port,process.env.LGUI_WEB_PORT||'4182','Only the supplied local fidelity server is permitted');return url;}
function failure(code,message){const error=new Error(message);error.code=code;return error;}
export async function probePage(value){
 const url=loopback(value);
 const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(5000)});
 const html=await response.text();
 const facts={url:url.href,status:response.status,contentType:response.headers.get('content-type'),htmlSha256:sha256(html),identity:html.includes('data-fidelity-page="reference-v1"')||html.includes("data-fidelity-page='reference-v1'")};
 if(response.status!==200)throw Object.assign(failure('missing_page',`Fidelity page HTTP ${response.status}; no browser was launched.`),{facts});
 if(!facts.identity)throw Object.assign(failure('old_or_wrong_page','Page lacks data-fidelity-page=reference-v1; the previous complex page cannot satisfy this acceptance.'),{facts});
 return facts;
}
const normalizeView=view=>({...view,revision:0});
function numberText(text){return Number(text.replace(/[^0-9]/g,''));}

export async function runAcceptance(argv=process.argv.slice(2)){
 const flag=(name,fallback)=>{const index=argv.indexOf(name);return index<0?fallback:argv[index+1];};
 const url=flag('--url',`http://127.0.0.1:${process.env.LGUI_WEB_PORT||4182}/fidelity/`);loopback(url);
 const probeOnly=argv.includes('--probe-only');
 const label=flag('--label',probeOnly?'probe':'browser');assert.match(label,/^[a-zA-Z0-9_-]+$/);
 const channel=flag('--browser',process.env.BROWSER||'chrome');assert(['chrome','edge'].includes(channel));
 const stamp=new Date().toISOString().replaceAll(':','-');
 const output=path.join(here,'evidence',`accept-${stamp}-${label}`);await fs.mkdir(output,{recursive:true});
 const report={schemaVersion:1,startedAt:new Date().toISOString(),url,mode:probeOnly?'http-identity-probe':'real-dom-input',channel,status:'running',expectations:EXPECTATIONS,checks:[],errors:[],requests:[],requestFailures:[],blockedExternal:[],screenshots:[],viewports:[],limitations:[EXPECTATIONS.scope,EXPECTATIONS.visualPolicy],partialReasons:[]};
 const check=(name,condition,evidence)=>{report.checks.push({name,passed:!!condition,evidence});assert.ok(condition,name);};
 let browser,context,page;
 try{
  report.pageProbe=await probePage(url);check('fidelity identity rejects absent and old pages',true,report.pageProbe);
  if(probeOnly){report.status='probe-passed';return report;}
  report.sourceFiles=await Promise.all(['accept-fidelity.mjs','fidelity.js','app.js','reference-fixture.json','skin-manifest.json','layout-reference.json','vendor/fairygui.module.js'].map(async file=>{const bytes=await fs.readFile(path.join(here,file));return{file,bytes:bytes.length,sha256:sha256(bytes)};}));
  const require=createRequire(path.resolve(root,'../../package.json'));
  const {chromium}=require('playwright');
  const sharp=createRequire(path.resolve(root,'../../toolchain-test/package.json'))('sharp');
  const executablePath=channel==='edge'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':'C:/Program Files/Google/Chrome/Application/chrome.exe';
  browser=await chromium.launch({headless:true,executablePath});report.browserVersion=browser.version();report.headless=true;
  context=await browser.newContext({viewport:{width:1586,height:992},deviceScaleFactor:1});
  await context.route('**/*',async route=>{
   const target=route.request().url();
   if(target.startsWith('data:')||target.startsWith('blob:'))return route.continue();
   try{loopback(target);return route.continue();}catch{report.blockedExternal.push(target);return route.abort('blockedbyclient');}
  });
  page=await context.newPage();const imageJobs=[],images=[];
  const reference=await fs.readFile(path.join(root,'art/reference.png'));
  const referenceRaw=await sharp(reference).ensureAlpha().raw().toBuffer();
  report.reference={file:'art/reference.png',sha256:sha256(reference),width:1586,height:992};
  page.on('pageerror',error=>report.errors.push({kind:'pageerror',message:String(error)}));
  page.on('console',message=>{if(message.type()==='error')report.errors.push({kind:'console',message:message.text()});});
  page.on('requestfailed',request=>report.requestFailures.push({url:request.url(),error:request.failure()?.errorText}));
  page.on('response',response=>{
   report.requests.push({url:response.url(),status:response.status(),type:response.request().resourceType()});
   if(response.request().resourceType()==='image'&&response.ok())imageJobs.push((async()=>{
    const bytes=await response.body();const info=await sharp(bytes).metadata();
    let matchesReferencePixels=false;
    if(info.width===1586&&info.height===992)matchesReferencePixels=sha256(await sharp(bytes).ensureAlpha().raw().toBuffer())===sha256(referenceRaw);
    images.push({url:response.url(),bytes:bytes.length,width:info.width,height:info.height,sha256:sha256(bytes),matchesReferencePixels});
   })().catch(error=>{images.push({url:response.url(),inspectionError:String(error)});}));
  });
  await page.goto(url,{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>window.complexVerification?.ready,{},{timeout:30000});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(image=>image.decode?.().catch(()=>{})));});
  await page.waitForTimeout(250);await Promise.all(imageJobs);
  const read=()=>page.evaluate(()=>window.complexVerification.snapshot());
  const business=async()=>JSON.parse((await read()).rawTsResponse);
  const testid=name=>page.locator(`[data-testid="${name}"]`);
  // The native input and its FairyGUI wrapper intentionally share the search name.
  const search=page.locator('input[data-testid="search"],textarea[data-testid="search"]');
  const cell=id=>page.locator(`[data-item-id="${id}"]`);
  const waitFor=async(predicate,label)=>{const end=Date.now()+6000;let value;while(Date.now()<end){value=await business();if(predicate(value))return value;await sleep(60);}throw Error(`State did not settle: ${label}; ${JSON.stringify(value).slice(0,350)}`);};
  const click=async name=>{const locator=testid(name);assert.equal(await locator.count(),1,`Unique actual control: ${name}`);await locator.click({timeout:5000});};
  const select=async id=>{assert.equal(await cell(id).count(),1,`Unique actual pooled item: ${id}`);await cell(id).click();await waitFor(r=>r.view.selectedId===id,`select ${id}`);};
  const menu=async name=>{if(!await testid(name).isVisible())await click('menu');await testid(name).waitFor({state:'visible'});await click(name);};
  const screenshot=async(name,viewport)=>{const file=path.join(output,`${name}.png`);await page.screenshot({path:file});report.screenshots.push({name,path:file,viewport});return file;};
  const fixture=JSON.parse(await fs.readFile(path.join(here,'reference-fixture.json'),'utf8'));
  const initial=await read(),r=JSON.parse(initial.rawTsResponse),v=r.view;
  report.initialSnapshot=initial;report.initialImages=[...images];
  await fs.writeFile(path.join(output,'initial-snapshot.json'),JSON.stringify(initial,null,2));
  // This file is captured before any click, filter, storage or business mutation.
  await screenshot('initial-canonical-1586x992',{width:1586,height:992});
  check('actual FairyGUI DOM stage without canvas or iframe',await page.locator('.fgui-stage').count()===1&&await page.locator('canvas,iframe').count()===0);
  check('this version truthfully uses 24 fixed native cells',initial.ui.virtualList===false&&initial.ui.physicalRows===24&&initial.ui.virtualItems===24);
  check('local FairyGUI runtime is loaded',report.requests.some(request=>/fairygui[^/]*\.js(?:$|\?)/i.test(request.url)&&request.status===200&&request.type==='script'));
  check('initial fixture is real shared state with 24 stacks',v.usedSlots===24&&v.items.length===24&&v.visible.length===24&&v.capacity===30&&v.coins===12480);
  check('initial order IDs and quantities match schema-1 fixture',JSON.stringify(v.items.map(item=>({id:item.id,kind:item.kind,quantity:item.quantity})))===JSON.stringify(fixture.items));
  check('initial selection filters and three sword stats are real',v.selectedId==='sword-1'&&v.category==='all'&&v.query===''&&v.sort==='default'&&JSON.stringify(v.selected.stats)===JSON.stringify(EXPECTATIONS.initial.swordStats));
  check('coins are a real changing text field',numberText(await testid('coins').innerText())===12480);
  for(const [name,value]of [['stat_attack','48'],['stat_crit','6%'],['stat_durability','100']])check(`${name} has the shared initial value`,(await testid(name).innerText()).replace(/\s+/g,'').includes(value));
  const cells=await page.locator('[data-item-id]').evaluateAll(nodes=>nodes.map(node=>{
   const rect=node.getBoundingClientRect();const texts=[...node.querySelectorAll('.fgui-text')].filter(text=>{const style=getComputedStyle(text);return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity)!==0&&text.getBoundingClientRect().width>0;}).map(text=>text.innerText.trim()).filter(Boolean);
   return{id:node.dataset.itemId,rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},texts};
  }));
  report.initialCells=cells;
  check('all 24 native cells form six columns and four rows',cells.length===24&&new Set(cells.map(c=>c.rect.x.toFixed(1))).size===6&&new Set(cells.map(c=>c.rect.y.toFixed(1))).size===4,cells.map(c=>({id:c.id,rect:c.rect})));
  check('all canonical cells lie inside the 1586x992 viewport',cells.every(c=>c.rect.x>=0&&c.rect.y>=0&&c.rect.x+c.rect.width<=1586.01&&c.rect.y+c.rect.height<=992.01));
  for(const item of v.items){const c=cells.find(cell=>cell.id===item.id);assert(c,`Physical cell missing ${item.id}`);check(`${item.id}: true quantity including one, no cell name label`,c.texts.some(text=>/^\s*[×x]?\s*\d+\s*$/.test(text)&&numberText(text)===item.quantity)&&!c.texts.some(text=>text.includes(item.name)),c.texts);}
  for(const name of ['menu_save','menu_load','menu_reward'])check(`${name} stays outside the initial main panel`,await testid(name).count()===0||!await testid(name).isVisible());
  const visualUrls=await page.evaluate(()=>{const urls=new Set();for(const node of document.querySelectorAll('*')){if(node instanceof HTMLImageElement&&node.currentSrc)urls.add(node.currentSrc);const style=getComputedStyle(node);for(const text of [style.backgroundImage,style.borderImageSource])for(const match of text.matchAll(/url\(["']?([^"')]+)["']?\)/g))urls.add(new URL(match[1],location.href).href);}return [...urls];});
  report.initialDomImageUrls=visualUrls;
  const referenceUrl=url=>decodeURIComponent(new URL(url).pathname).endsWith('/art/reference.png')||decodeURIComponent(new URL(url).pathname).endsWith('/reference.png');
  check('page never requests or displays the full reference image',!report.requests.some(request=>referenceUrl(request.url))&&!visualUrls.some(value=>!value.startsWith('data:')&&!value.startsWith('blob:')&&referenceUrl(value))&&!images.some(image=>image.matchesReferencePixels));
  check('more than 20 decomposed image assets are rendered and requested',new Set(visualUrls.filter(value=>value.startsWith(new URL(url).origin+'/'))).size>20&&new Set(images.map(image=>image.url)).size>20,{renderedUrls:visualUrls.length,requestedImages:images.length});

  await click('primary');let current=await waitFor(r=>r.view.equipment.weapon?.id==='sword-1','real equip');
  check('actual primary control equips selected sword',current.ok&&current.view.usedSlots===23&&(await testid('primary').innerText()).includes('卸下'));
  await click('primary');current=await waitFor(r=>r.view.equipment.weapon===null&&r.view.usedSlots===24,'real unequip');
  check('actual primary control unequips stable sword',current.view.items.some(item=>item.id==='sword-1'));
  await click('tab_consumable');await waitFor(r=>r.view.category==='consumable','consumable tab');await select('redPotion-1');
  await click('primary');current=await waitFor(r=>r.view.selected?.quantity===7,'use once');
  check('actual use changes shared quantity and visible text',current.ok&&(await cell('redPotion-1').innerText()).includes('7'));
  const beforeSale=normalizeView(current.view);
  await click('sell');await testid('confirm').waitFor({state:'visible'});
  check('sell opens a real confirmation without committing',JSON.stringify(normalizeView((await business()).view))===JSON.stringify(beforeSale));
  await click('cancel');check('cancel sale preserves all business state',JSON.stringify(normalizeView((await business()).view))===JSON.stringify(beforeSale));
  await click('sell');await click('confirm');current=await waitFor(r=>r.view.selected?.quantity===6&&r.view.coins===12492,'confirm one sale');
  check('real confirmation sells one and changes actual coin text',current.ok&&numberText(await testid('coins').innerText())===12492);
  const savedView=normalizeView(current.view);
  await menu('menu_save');await click('primary');await waitFor(r=>r.view.selected?.quantity===5,'mutate after real save');await menu('menu_load');
  current=await waitFor(r=>r.view.selected?.quantity===6,'real restore');
  check('menu save/load restore actual shared state',current.ok&&JSON.stringify(normalizeView(current.view))===JSON.stringify(savedView));
  report.storage=await page.evaluate(()=>Object.entries(localStorage).map(([key,value])=>({key,bytes:value.length})));
  check('save uses real local storage',report.storage.length>0);
  await click('tab_all');await waitFor(r=>r.view.category==='all','all tab');
  assert.equal(await search.count(),1,'One actual editable native search field');
  await search.fill('药水');current=await waitFor(r=>r.view.query==='药水','Chinese search');
  check('real Chinese input filters shared data',current.view.visible.length===3);
  await search.fill('');await waitFor(r=>r.view.query==='','clear query');await click('sort');await click('sort_name');current=await waitFor(r=>r.view.sort==='name','sort name');
  const names=current.view.visible.map(item=>item.name);
  check('real sort button changes business order and label',names.every((name,i)=>i===0||names[i-1]<=name)&&(await testid('sort').innerText()).includes('名称'));
  await menu('menu_reward');await testid('confirm').waitFor({state:'visible'});
  check('reward entry is an actual menu action',(await read()).ui.popup===true);
  const beforeReward=(await business()).view;
  await click('reward-progress');current=await waitFor(r=>r.view.rewards.items.every(item=>item.state!=='locked'),'real reward progress');
  check('real reward progress changes original shared reward rules',current.ok&&current.view.rewards.items.filter(item=>item.state==='ready').length>beforeReward.rewards.items.filter(item=>item.state==='ready').length);
  const beforeClaim=current.view;
  await click('reward-claim');current=await waitFor(r=>r.view.coins===beforeClaim.coins+10,'real reward claim');
  check('real reward claim credits ten coins once',current.ok&&current.view.rewards.items.filter(item=>item.state==='claimed').length===beforeClaim.rewards.items.filter(item=>item.state==='claimed').length+1&&numberText(await testid('coins').innerText())===beforeClaim.coins+10);
  if(await testid('cancel').isVisible())await click('cancel');else await click('confirm');
  report.afterInteraction=await read();await fs.writeFile(path.join(output,'after-interaction-snapshot.json'),JSON.stringify(report.afterInteraction,null,2));
  await screenshot('after-real-controls-canonical',{width:1586,height:992});

  await page.setViewportSize({width:1280,height:800});await page.waitForTimeout(250);
  const medium=await read();const expectedScale=Math.min(1280/1586,800/992);
  report.viewports.push({requested:{width:1280,height:800},fidelity:medium.ui.fidelity,status:'geometry-observed',expectedUniformScale:expectedScale,visualAssessment:'pending root overlay and regional review'});
  check('1280 viewport retains canonical geometry through uniform scale',medium.ui.fidelity?.canonical?.width===1586&&medium.ui.fidelity?.canonical?.height===992&&typeof medium.ui.fidelity.scale==='number'&&Math.abs(medium.ui.fidelity.scale-expectedScale)<1e-8,{reported:medium.ui.fidelity,expectedScale,note:'Floating-point geometry comparison, not a visual/pixel fidelity threshold.'});
  await screenshot('uniform-1280x800',{width:1280,height:800});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(250);const narrow=await read();
  report.viewports.push({requested:{width:390,height:844},fidelity:narrow.ui.fidelity,status:'partial',reason:'Whole-panel fit is recorded; narrow-screen readability, reflow and mobile-device usability are not established.'});
  await screenshot('narrow-fit-390x844-partial',{width:390,height:844});
  report.partialReasons.push('390 viewport whole-panel fit is not a complete narrow-screen usability acceptance.','Reference 1:1 visual fidelity awaits root capture-compare and human regional review; no numerical pass threshold is applied.');
  await Promise.all(imageJobs);
  check('all page resources remain local and successful',report.blockedExternal.length===0&&report.requests.every(request=>request.status<400)&&report.requestFailures.length===0,{blockedExternal:report.blockedExternal,failedRequests:report.requestFailures});
  check('no unexplained browser or shared-host errors',report.errors.length===0&&Array.isArray(narrow.errors)&&narrow.errors.length===0,{browser:report.errors,host:narrow.errors});
  report.functionalStatus='passed';report.visualStatus='pending-region-review';report.status='partial';
 }catch(error){
  report.status='failed';report.failure={code:error.code||'acceptance_assertion',message:String(error),stack:error.stack};if(error.facts)report.pageProbe=error.facts;
  if(page&&!page.isClosed()){
   try{report.failureSnapshot=await page.evaluate(()=>window.complexVerification?.snapshot());}catch(readError){report.failureReadError=String(readError);}
   try{const file=path.join(output,'failure-current-page.png');await page.screenshot({path:file});report.screenshots.push({name:'failure-current-page',path:file});}catch(captureError){report.failureCaptureError=String(captureError);}
  }
 }
 finally{
  if(context)await context.close();if(browser)await browser.close();
  report.completedAt=new Date().toISOString();const outputFile=path.join(output,'result.json');
  await fs.writeFile(outputFile,JSON.stringify(report,null,2));
  console.log(JSON.stringify({status:report.status,functionalStatus:report.functionalStatus,checks:report.checks.map(({name,passed})=>({name,passed})),failure:report.failure,partialReasons:report.partialReasons,output:outputFile},null,2));
 }
 return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const report=await runAcceptance();process.exitCode=report.status==='failed'?1:report.status==='partial'?2:0;}
