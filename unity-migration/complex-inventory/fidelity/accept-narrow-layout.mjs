import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {probePage} from './accept-fidelity.mjs';

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'..');
const hash=value=>createHash('sha256').update(value).digest('hex');
const normalize=view=>({...view,revision:0});
const inside=(r,box)=>r&&r.width>0&&r.height>0&&r.x>=box.x-.02&&r.y>=box.y-.02&&r.right<=box.x+box.width+.02&&r.bottom<=box.y+box.height+.02;
const intersects=(a,b)=>Math.min(a.right,b.right)-Math.max(a.x,b.x)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>.5;
const origin='http://127.0.0.1:4182',url=origin+'/fidelity/';

export async function runNarrow(argv=process.argv.slice(2)){
 const flag=(name,fallback)=>{const i=argv.indexOf(name);return i<0?fallback:argv[i+1];};
 const channel=flag('--browser',process.env.BROWSER||'chrome'),label=flag('--label',channel);assert(['chrome','edge'].includes(channel));assert.match(label,/^[\w-]+$/);
 const overlaysOnly=argv.includes('--overlays-only');
 const output=path.join(here,'evidence',`narrow-${new Date().toISOString().replaceAll(':','-')}-${label}`);await fs.mkdir(output,{recursive:true});
 const report={schemaVersion:1,startedAt:new Date().toISOString(),channel,mode:overlaysOnly?'changed-overlay-and-layout-smoke':'full-narrow-controls',status:'running',checks:[],cases:[],errors:[],requests:[],requestFailures:[],blockedExternal:[],screenshots:[],limitations:['Isolated headless Playwright DOM input; no Computer Use, OS input, Unity or mobile hardware.','486x727 and 390x844 narrow layout and controls; 754x743 and 794x727 smoke only. No 200-cycle rerun.','No whole-reference 1:1 visual fidelity pass is assigned.']};
 const check=(name,ok,facts)=>{report.checks.push({name,passed:!!ok,facts});assert(ok,name);};
 let browser,context,page;
 try{
  await probePage(url);
  const manifest=JSON.parse(await fs.readFile(path.join(here,'skin-manifest.json'),'utf8')),details=JSON.parse(await fs.readFile(path.join(here,'detail-icons.json'),'utf8'));
  const sources=[...new Set(['accept-narrow-layout.mjs','fidelity.js','app.js','reference-fixture.json','skin-manifest.json','detail-icons.json','vendor/fairygui.module.js',...Object.values(manifest.assets).map(asset=>asset.file),...details.entries.map(entry=>entry.file)])];
  report.sources=await Promise.all(sources.map(async file=>({file,sha256:hash(await fs.readFile(path.join(here,file)))})));
  const {chromium}=createRequire(path.resolve(root,'../../package.json'))('playwright'),sharp=createRequire(path.resolve(root,'../../toolchain-test/package.json'))('sharp');
  browser=await chromium.launch({headless:true,executablePath:channel==='edge'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':'C:/Program Files/Google/Chrome/Application/chrome.exe'});report.browserVersion=browser.version();
  for(const size of [{width:486,height:727},{width:390,height:844}]){
   const id=`${size.width}x${size.height}`,currentCase={id,viewport:size,layouts:[],images:[],groups:[],overlays:[]};report.cases.push(currentCase);
   context=await browser.newContext({viewport:size,deviceScaleFactor:1});
   await context.route('**/*',async route=>{const value=route.request().url();if(value.startsWith('data:')||value.startsWith('blob:')||new URL(value).origin===origin)return route.continue();report.blockedExternal.push(value);return route.abort('blockedbyclient');});
   page=await context.newPage();
   page.on('pageerror',error=>report.errors.push({case:id,message:String(error)}));page.on('console',message=>{if(message.type()==='error')report.errors.push({case:id,message:message.text()});});
   page.on('requestfailed',request=>report.requestFailures.push({case:id,url:request.url(),error:request.failure()?.errorText}));page.on('response',response=>report.requests.push({case:id,url:response.url(),status:response.status()}));
   await page.goto(url,{waitUntil:'networkidle',timeout:30000});await page.waitForFunction(()=>window.complexVerification?.ready,{},{timeout:30000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(150);
   const control=name=>page.locator(`[data-testid="${name}"]`),slot=item=>page.locator(`[data-item-id="${item}"]`);
   const read=()=>page.evaluate(()=>window.complexVerification.snapshot()),business=async()=>JSON.parse((await read()).rawTsResponse);
   const viewbox=()=>({x:0,y:0,...page.viewportSize()});
   const rect=locator=>locator.evaluate(node=>node.getBoundingClientRect().toJSON());
   const shot=async name=>{const file=path.join(output,`${id}-${name}.png`);await page.screenshot({path:file});report.screenshots.push({case:id,name,file,viewport:page.viewportSize()});};
   const settle=async predicate=>{for(let i=0;i<100;i++){const value=await business();if(predicate(value))return value;await page.waitForTimeout(50);}throw Error(`State did not settle in ${id}`);};
   const textRect=locator=>locator.evaluate(node=>{const span=node.querySelector('.fgui-text')||node,range=document.createRange();range.selectNodeContents(span);const raw=range.getBoundingClientRect(),glyphs=[],walker=document.createTreeWalker(span,NodeFilter.SHOW_TEXT);let text;while(text=walker.nextNode())for(let i=0;i<text.length;i++)if(/\S/.test(text.textContent[i])){const char=document.createRange();char.setStart(text,i);char.setEnd(text,i+1);glyphs.push(char.getBoundingClientRect());}const left=Math.min(...glyphs.map(r=>r.x)),top=Math.min(...glyphs.map(r=>r.y)),right=Math.max(...glyphs.map(r=>r.right)),bottom=Math.max(...glyphs.map(r=>r.bottom)),r=glyphs.length?new DOMRect(left,top,right-left,bottom-top):raw,clips=[];for(let p=span;p;p=p.parentElement){const s=getComputedStyle(p),x=/hidden|clip|auto|scroll/.test(s.overflowX),y=/hidden|clip|auto|scroll/.test(s.overflowY);if(x||y)clips.push({name:p.dataset.testid||p.tagName,rect:p.getBoundingClientRect().toJSON(),x,y});}return{text:span.textContent||node.value,rect:r.toJSON(),rawRangeRect:raw.toJSON(),measurement:'Union of non-whitespace character advance rectangles; line-ending spaces are excluded.',clips};});
   const click=async name=>{assert.equal(await control(name).count(),1);check(`${id}: ${name} actual hit area is in viewport`,inside(await rect(control(name)),viewbox()));await control(name).click({timeout:5000});};
   const select=async item=>{assert.equal(await slot(item).count(),1);check(`${id}: ${item} actual hit area is in viewport`,inside(await rect(slot(item)),viewbox()));await slot(item).click();return settle(r=>r.view.selectedId===item);};
   const cells=()=>page.locator('[data-item-id]').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{id:node.dataset.itemId,rect:r.toJSON(),hit:hit?.closest('[data-item-id]')?.dataset.itemId,quantities:[...node.querySelectorAll('[data-testid="quantity"]')].map(q=>q.getBoundingClientRect().toJSON())};}));
   const inspectLayout=async(name,columns,rows)=>{
    const s=await read(),b=JSON.parse(s.rawTsResponse),physical=await cells();
    const r=await rect(control('inventory')),matrix=await control('inventory').evaluate(node=>{const text=getComputedStyle(node).transform,m=new DOMMatrixReadOnly(text==='none'?undefined:text);return{x:Math.hypot(m.a,m.b),y:Math.hypot(m.c,m.d)};});
    check(`${id}/${name}: viewport is filled at actual native scale`,s.ui.fidelity.scale===1&&Math.abs(matrix.x-1)<1e-8&&Math.abs(matrix.y-1)<1e-8&&Math.abs(r.x)<.02&&Math.abs(r.y)<.02&&Math.abs(r.width-page.viewportSize().width)<.02&&Math.abs(r.height-page.viewportSize().height)<.02,{fidelity:s.ui.fidelity,matrix,rect:r});
    const actualColumns=new Set(physical.map(cell=>cell.rect.x.toFixed(1))).size,actualRows=new Set(physical.map(cell=>cell.rect.y.toFixed(1))).size;
    check(`${id}/${name}: all 24 equal-aspect cells are visible and hit-testable`,physical.length===24&&actualColumns*actualRows===24&&(!columns||actualColumns===columns)&&(!rows||actualRows===rows)&&physical.every(cell=>inside(cell.rect,viewbox())&&cell.hit===cell.id&&Math.abs((cell.rect.width/cell.rect.height)/(128/137)-1)<.01&&cell.quantities.length===1&&cell.quantities.every(q=>inside(q,cell.rect))),{actualColumns,actualRows,physical});
    const listBounds=await rect(control('list')),occupiedHeight=Math.max(...physical.map(cell=>cell.rect.bottom))-Math.min(...physical.map(cell=>cell.rect.y));
    check(`${id}/${name}: grid uses over 80 percent of the available list height`,occupiedHeight/listBounds.height>.8,{listBounds,occupiedHeight,occupancy:occupiedHeight/listBounds.height,note:'Observable content bounds; no implementation column-selection formula is duplicated.'});
    const frames=await Promise.all(['frameLeft','frameRight'].map(async name=>({name,rect:await rect(control(name))}))),header=await Promise.all(['tab_all','tab_equipment','tab_consumable','tab_material','tab_quest'].map(async name=>({name,rect:await rect(control(name))})));
    const lastHeader=Math.max(...header.map(item=>item.rect.bottom)),panelTop=Math.min(...frames.map(item=>item.rect.y)),panelBottom=Math.max(...frames.map(item=>item.rect.bottom));
    check(`${id}/${name}: panels follow controls without large letterboxes`,frames.every(frame=>inside(frame.rect,viewbox()))&&panelTop>=lastHeader-.02&&panelTop-lastHeader<=24&&panelBottom>page.viewportSize().height-100,{frames,header,panelTop,panelBottom,lastHeader});
    const fonts=await page.locator('[data-testid="inventory"] .fgui-text,[data-testid="inventory"] input,[data-testid="inventory"] textarea').evaluateAll(nodes=>nodes.flatMap(node=>{const s=getComputedStyle(node),r=node.getBoundingClientRect();if(!r.width||!r.height||s.display==='none'||s.visibility==='hidden'||!(node.textContent||node.value||node.placeholder||'').trim())return[];let k=1;for(let p=node;p;p=p.parentElement){const t=getComputedStyle(p).transform;if(t!=='none'){const m=new DOMMatrixReadOnly(t);k*=Math.min(Math.hypot(m.a,m.b),Math.hypot(m.c,m.d));}}return[{name:node.closest('[data-testid]')?.dataset.testid,effective:parseFloat(s.fontSize)*k}];}));
    check(`${id}/${name}: visible body font is at least 16px`,fonts.length>24&&fonts.every(font=>font.effective>=15.999),fonts.filter(font=>font.effective<15.999));
    check(`${id}/${name}: resize keeps one business subscription`,b.session.listenerCount===1&&b.session.opens===1&&b.session.closedCallbacks===0&&b.session.listenerErrors===0,b.session);
    currentCase.layouts.push({name,size:page.viewportSize(),ui:s.ui,session:b.session,fontMinimum:Math.min(...fonts.map(font=>font.effective))});
   };
   const inspectDetailContent=async name=>{
    const visible=await page.locator('[data-testid="detailTitle"],[data-testid="rarity"],[data-testid="description"],[data-testid="itemNote"],[data-testid^="stat-label-"],[data-testid="stat_attack"],[data-testid="stat_crit"],[data-testid="stat_durability"]').evaluateAll(nodes=>nodes.flatMap(node=>{const r=node.getBoundingClientRect(),s=getComputedStyle(node);if(!r.width||!r.height||s.visibility==='hidden'||s.display==='none')return[];const span=node.querySelector('.fgui-text')||node,range=document.createRange();range.selectNodeContents(span);const raw=range.getBoundingClientRect(),glyphs=[],walker=document.createTreeWalker(span,NodeFilter.SHOW_TEXT);let text;while(text=walker.nextNode())for(let i=0;i<text.length;i++)if(/\S/.test(text.textContent[i])){const char=document.createRange();char.setStart(text,i);char.setEnd(text,i+1);glyphs.push(char.getBoundingClientRect());}const left=Math.min(...glyphs.map(r=>r.x)),top=Math.min(...glyphs.map(r=>r.y)),right=Math.max(...glyphs.map(r=>r.right)),bottom=Math.max(...glyphs.map(r=>r.bottom)),actual=glyphs.length?new DOMRect(left,top,right-left,bottom-top):raw,clips=[];for(let p=span;p;p=p.parentElement){const style=getComputedStyle(p),x=/hidden|clip|auto|scroll/.test(style.overflowX),y=/hidden|clip|auto|scroll/.test(style.overflowY);if(x||y)clips.push({name:p.dataset.testid||p.tagName,rect:p.getBoundingClientRect().toJSON(),x,y});}return actual.width&&actual.height?[{name:node.dataset.testid,text:span.textContent,rect:actual.toJSON(),rawRangeRect:raw.toJSON(),container:r.toJSON(),clips}]:[];}));
    const image=await control('detailIcon').evaluate(node=>{const image=[...node.querySelectorAll('*')].find(child=>getComputedStyle(child).backgroundImage!=='none');return image?.getBoundingClientRect().toJSON();});
    const actions=await Promise.all(['primary','sell'].map(async name=>({name,rect:await rect(control(name))})));
    const conflicts=[];for(let i=0;i<visible.length;i++){if(!inside(visible[i].rect,viewbox()))conflicts.push({kind:'text-outside-viewport',a:visible[i]});for(const clip of visible[i].clips){const a=visible[i].rect,b=clip.rect;if((clip.x&&(a.x<b.x-.02||a.right>b.right+.02))||(clip.y&&(a.y<b.y-.02||a.bottom>b.bottom+.02)))conflicts.push({kind:'text-outside-actual-clipping-region',a:visible[i],clip});}for(let j=i+1;j<visible.length;j++)if(intersects(visible[i].rect,visible[j].rect))conflicts.push({kind:'text-overlap',a:visible[i],b:visible[j]});for(const action of actions)if(intersects(visible[i].rect,action.rect))conflicts.push({kind:'text-over-action',a:visible[i],b:action});if(image&&intersects(visible[i].rect,image))conflicts.push({kind:'text-over-item-image',a:visible[i],b:image});}
    check(`${id}/${name}: detail text, art and action areas do not overlap or truncate`,conflicts.length===0,{visible,image,actions,conflicts});
   };
   const inspectImage=async(item,kind)=>{
    const s=await read(),entry=details.entries.find(entry=>entry.index===JSON.parse(s.rawTsResponse).view.selected.iconIndex),actual=s.ui.detail;
    assert(entry);const bytes=await fs.readFile(path.join(here,entry.file)),meta=await sharp(bytes).metadata();
    check(`${id}/${item}: actual trimmed file and natural image ratio are preserved`,actual.url===new URL(entry.file,url).href&&actual.naturalSize.width===meta.width&&actual.naturalSize.height===meta.height&&hash(bytes)===entry.sha256&&inside({...actual.imageRect,right:actual.imageRect.x+actual.imageRect.width,bottom:actual.imageRect.y+actual.imageRect.height},viewbox())&&Math.abs((actual.imageRect.width/actual.imageRect.height)/(meta.width/meta.height)-1)<.01,{entry,actual});
    currentCase.images.push({item,kind,entry,actual});
   };
   const inspectActions=async name=>{
    for(const [button,icon]of [['primary','compass'],['sell','sellCoins']]){
     const b=await rect(control(button)),t=await textRect(control(button+'-label'));
     const image=await control(icon).evaluate(node=>[node,...node.querySelectorAll('*')].flatMap(child=>{const s=getComputedStyle(child),r=child.getBoundingClientRect();const match=s.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);return match?[{url:new URL(match[1],location.href).href,rect:r.toJSON()}]:[];})).then(images=>images.find(image=>image.rect.width>0));
     const assetKey=await control(icon).getAttribute('data-skin-asset'),asset=manifest.assets[assetKey],groupLeft=Math.min(image.rect.x,t.rect.x),groupRight=Math.max(image.rect.right,t.rect.right),delta=(groupLeft+groupRight)/2-(b.x+b.width/2);
     const facts={button,name,buttonRect:b,text:t,icon:image,assetKey,delta,roundedDelta:Math.round(delta)};
     const unclipped=t.clips.every(clip=>(!clip.x||(t.rect.x>=clip.rect.x-.02&&t.rect.right<=clip.rect.right+.02))&&(!clip.y||(t.rect.y>=clip.rect.y-.02&&t.rect.bottom<=clip.rect.bottom+.02)));
     check(`${id}/${name}: ${button} icon and full text fit without clipping and stay centered`,inside(b,viewbox())&&inside(t.rect,b)&&unclipped&&inside(image.rect,b)&&t.rect.x>=image.rect.right-.02&&Math.abs(Math.round(delta))<=2&&assetKey?.endsWith('Alpha')&&image.url===new URL(asset.file,url).href&&Math.abs((image.rect.width/image.rect.height)/(asset.width/asset.height)-1)<.01,facts);currentCase.groups.push(facts);
    }
   };
   const overlay=async(names,name)=>{
    const facts=[];for(const field of names){const r=await rect(control(field)),text=await textRect(control(field));facts.push({name:field,rect:r,text});}
    const intersections=[];for(let i=0;i<facts.length;i++)for(let j=i+1;j<facts.length;j++)if(intersects(facts[i].rect,facts[j].rect))intersections.push([facts[i].name,facts[j].name]);
    check(`${id}/${name}: every real overlay button and its text is inside the window`,facts.every(fact=>inside(fact.rect,viewbox())&&inside(fact.text.rect,fact.rect))&&intersections.length===0,{facts,intersections});
    if(await control('popup-body').count()){
     const body=await textRect(control('popup-body')),container=await rect(control('popup-body'));
     const unclipped=body.clips.every(clip=>(!clip.x||(body.rect.x>=clip.rect.x-.02&&body.rect.right<=clip.rect.right+.02))&&(!clip.y||(body.rect.y>=clip.rect.y-.02&&body.rect.bottom<=clip.rect.bottom+.02)));
     check(`${id}/${name}: popup message is not clipped and does not cross an action button`,inside(body.rect,viewbox())&&unclipped&&facts.every(fact=>!intersects(body.rect,fact.rect)),{body,container,buttons:facts});
    }
    currentCase.overlays.push({name,facts});
   };
   const menu=async name=>{await click('menu');await overlay(['menu_save','menu_load','menu_reward'],'storage-menu');await shot('storage-menu');await click(name);};
   const initial=await read();currentCase.initial=initial;await shot('initial');
   check(`${id}: initial fixture is 24 real items and 12480 coins`,JSON.parse(initial.rawTsResponse).view.usedSlots===24&&JSON.parse(initial.rawTsResponse).view.coins===12480&&initial.ui.virtualList===false);
   await inspectLayout('initial');await inspectDetailContent('initial-sword');await inspectActions('initial-sword');
   if(!overlaysOnly){
   await select('ring-1');await inspectImage('ring-1','ring');await inspectDetailContent('ring');await inspectActions('ring');await shot('ring');
   await click('primary');await settle(r=>r.view.equipment.ring?.id==='ring-1');await click('primary');await settle(r=>r.view.equipment.ring===null&&r.view.usedSlots===24);
   await select('key-1');await inspectImage('key-1','key');await inspectDetailContent('quest');await inspectActions('quest-four-characters');await shot('quest');
   check(`${id}: quest controls really disable use and sale`,await control('primary').getAttribute('aria-disabled')==='true'&&await control('sell').getAttribute('aria-disabled')==='true');
   await select('redPotion-1');await inspectImage('redPotion-1','redPotion');await inspectDetailContent('potion');await inspectActions('potion');await shot('potion');
   await click('primary');await settle(r=>r.view.selected?.quantity===7);const beforeSale=normalize((await business()).view);
   await click('sell');await overlay(['confirm','cancel'],'sell-confirm');await shot('sell-confirm');await click('cancel');check(`${id}: cancel sale is atomic`,JSON.stringify(normalize((await business()).view))===JSON.stringify(beforeSale));
   await click('sell');await overlay(['confirm','cancel'],'sell-confirm-reopen');await click('confirm');await settle(r=>r.view.selected?.quantity===6&&r.view.coins===12492);
   await click('sort');await overlay(['sort_default','sort_name','sort_rarity','sort_price','sort_quantity'],'sort-menu');await shot('sort-menu');await click('sort_name');await settle(r=>r.view.sort==='name');
   const saved=normalize((await business()).view);await menu('menu_save');await click('primary');await settle(r=>r.view.selected?.quantity===5);await menu('menu_load');await settle(r=>r.view.selected?.quantity===6);check(`${id}: actual save/load restores full business`,JSON.stringify(normalize((await business()).view))===JSON.stringify(saved));
   }else{
    const before=normalize((await business()).view);await click('sell');await overlay(['confirm','cancel'],'changed-sell-popup');await shot('changed-sell-popup');await click('cancel');check(`${id}: changed sale popup cancellation preserves state`,JSON.stringify(normalize((await business()).view))===JSON.stringify(before));
   }
   const beforeRewardCoins=(await business()).view.coins;
   await menu('menu_reward');await overlay(['confirm','cancel','reward-progress','reward-claim'],'reward-popup');await shot('rewards');
   await click('reward-progress');await settle(r=>r.view.rewards.items.every(item=>item.state!=='locked'));await click('reward-claim');await settle(r=>r.view.coins===beforeRewardCoins+10);await overlay(['confirm','cancel','reward-progress','reward-claim'],'claimed-reward-popup');await shot('rewards-claimed');await click('cancel');
   const beforeResize=normalize((await business()).view);
   if(size.width===390)for(const wide of [{width:754,height:743},{width:794,height:727}]){await page.setViewportSize(wide);await page.waitForTimeout(150);await inspectLayout(`wide-smoke-${wide.width}`,4,6);await inspectDetailContent(`wide-smoke-${wide.width}`);await inspectActions(`wide-smoke-${wide.width}`);await shot(`wide-smoke-${wide.width}x${wide.height}`);check(`${id}: wide smoke ${wide.width} preserves state`,JSON.stringify(normalize((await business()).view))===JSON.stringify(beforeResize));}
   currentCase.final=await read();check(`${id}: no host errors and no extra subscriptions`,currentCase.final.errors.length===0&&JSON.parse(currentCase.final.rawTsResponse).session.listenerCount===1&&JSON.parse(currentCase.final.rawTsResponse).session.opens===1,currentCase.final.errors);
   await context.close();context=null;page=null;
  }
  report.completedSources=await Promise.all(report.sources.map(async item=>({...item,completedSha256:hash(await fs.readFile(path.join(here,item.file)))})));
  check('source artifacts are unchanged throughout narrow and wide smoke runs',report.completedSources.every(source=>source.sha256===source.completedSha256));
  check('no browser errors, failed or external requests',report.errors.length===0&&report.requestFailures.length===0&&report.blockedExternal.length===0&&report.requests.every(request=>request.status<400),{errors:report.errors,failures:report.requestFailures,blocked:report.blockedExternal});
  report.status='passed';report.visualStatus='not-assessed';
 }catch(error){report.status='failed';report.failure={message:String(error),stack:error.stack};if(page&&!page.isClosed()){try{report.failureSnapshot=await page.evaluate(()=>window.complexVerification?.snapshot());}catch(error){report.failureReadError=String(error);}try{const file=path.join(output,'failure.png');await page.screenshot({path:file});report.screenshots.push({name:'failure',file});}catch{}}}
 finally{if(context)await context.close();if(browser)await browser.close();report.completedAt=new Date().toISOString();const file=path.join(output,'result.json');await fs.writeFile(file,JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:report.checks.map(({name,passed})=>({name,passed})),failure:report.failure,output:file},null,2));}
 return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const result=await runNarrow();process.exitCode=result.status==='passed'?0:1;}
