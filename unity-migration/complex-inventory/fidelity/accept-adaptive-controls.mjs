import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {probePage} from './accept-fidelity.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const sha256=value=>createHash('sha256').update(value).digest('hex');
const normalized=view=>({...view,revision:0});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const rectInside=(r,v)=>r&&r.width>0&&r.height>0&&r.x>=-.01&&r.y>=-.01&&r.x+r.width<=v.width+.01&&r.y+r.height<=v.height+.01;
const numeric=text=>Number(text.replace(/[^0-9]/g,''));
const local=value=>{const url=new URL(value);assert.equal(url.origin,'http://127.0.0.1:4182','Only the supplied local server is permitted');return url;};

export const EXPECTATIONS={
 viewport:{width:754,height:743,deviceScaleFactor:1},
 grid:{columns:4,rows:6,count:24,virtual:false},
 bodyFontMinimum:16,rootScale:1,
 pane:{topLessThan:140,bottomGreaterThanViewportMinus:100},
 inputMethod:'Playwright DOM events in isolated headless browser; no OS input, Computer Use, Unity or mobile hardware.',
 scope:'754x743 adaptive control usability, actual shared business, local storage and resize subscription stability. Visual likeness is reviewed separately.',
};

export async function runAdaptiveAcceptance(argv=process.argv.slice(2)){
 const flag=(key,fallback)=>{const index=argv.indexOf(key);return index<0?fallback:argv[index+1];};
 const channel=flag('--browser',process.env.BROWSER||'chrome');assert(['chrome','edge'].includes(channel));
 const label=flag('--label',channel);assert.match(label,/^[\w-]+$/);
 const url=flag('--url','http://127.0.0.1:4182/fidelity/');local(url);
 const output=path.join(here,'evidence',`adaptive-controls-${new Date().toISOString().replaceAll(':','-')}-${label}`);
 await fs.mkdir(output,{recursive:true});
 const report={schemaVersion:1,startedAt:new Date().toISOString(),url,channel,status:'running',expectations:EXPECTATIONS,checks:[],steps:[],screenshots:[],layouts:[],detailImages:[],controlArt:[],errors:[],requests:[],requestFailures:[],blockedExternal:[],limitations:[EXPECTATIONS.inputMethod,EXPECTATIONS.scope,'Alpha/source identity and geometry checks do not replace human inspection of artwork, text glyphs, or 1:1 reference likeness.']};
 const check=(name,ok,evidence)=>{report.checks.push({name,passed:!!ok,evidence});assert.ok(ok,name);};
 let browser,context,page;
 try{
  report.pageProbe=await probePage(url);
  const manifest=JSON.parse(await fs.readFile(path.join(here,'skin-manifest.json'),'utf8'));
  const detailManifest=JSON.parse(await fs.readFile(path.join(here,'detail-icons.json'),'utf8'));
  const sourceNames=[...new Set(['accept-adaptive-controls.mjs','fidelity.js','app.js','reference-fixture.json','skin-manifest.json','layout-reference.json','detail-icons.json','vendor/fairygui.module.js',...Object.values(manifest.assets).map(asset=>asset.file),...detailManifest.entries.map(entry=>entry.file)])];
  report.sourceFiles=await Promise.all(sourceNames.map(async file=>{const bytes=await fs.readFile(path.join(here,file));return{file,bytes:bytes.length,sha256:sha256(bytes)};}));
  const {chromium}=createRequire(path.resolve(root,'../../package.json'))('playwright');
  const sharp=createRequire(path.resolve(root,'../../toolchain-test/package.json'))('sharp');
  browser=await chromium.launch({headless:true,executablePath:channel==='edge'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  report.browserVersion=browser.version();
  context=await browser.newContext({viewport:{width:754,height:743},deviceScaleFactor:1});
  await context.route('**/*',async route=>{const value=route.request().url();if(value.startsWith('data:')||value.startsWith('blob:'))return route.continue();try{local(value);return route.continue();}catch{report.blockedExternal.push(value);return route.abort('blockedbyclient');}});
  page=await context.newPage();
  page.on('pageerror',error=>report.errors.push({kind:'pageerror',message:String(error)}));
  page.on('console',message=>{if(message.type()==='error')report.errors.push({kind:'console',message:message.text()});});
  page.on('requestfailed',request=>report.requestFailures.push({url:request.url(),error:request.failure()?.errorText}));
  page.on('response',response=>report.requests.push({url:response.url(),status:response.status(),type:response.request().resourceType()}));
  await page.goto(url,{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>window.complexVerification?.ready,{},{timeout:30000});
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(200);
  const viewport=()=>page.viewportSize();
  const read=()=>page.evaluate(()=>window.complexVerification.snapshot());
  const business=async()=>JSON.parse((await read()).rawTsResponse);
  const control=name=>page.locator(`[data-testid="${name}"]`);
  const slot=id=>page.locator(`[data-item-id="${id}"]`);
  const readRect=locator=>locator.evaluate(element=>element.getBoundingClientRect().toJSON());
  const capture=async name=>{const file=path.join(output,`${name}.png`);await page.screenshot({path:file});report.screenshots.push({name,file,viewport:viewport()});};
  const settle=async(predicate,label)=>{const end=Date.now()+6000;let value;while(Date.now()<end){value=await business();if(predicate(value))return value;await pause(50);}throw Error(`State did not settle: ${label}; ${JSON.stringify(value).slice(0,400)}`);};
  const inViewport=async(names,label)=>{
   const facts=[];
   for(const name of names){assert.equal(await control(name).count(),1,`Unique control ${name}`);facts.push({name,visible:await control(name).isVisible(),rect:await readRect(control(name))});}
   check(label,facts.every(value=>value.visible&&rectInside(value.rect,viewport())),facts);
   return facts;
  };
  const click=async name=>{await inViewport([name],`actual ${name} is fully inside viewport before click`);await control(name).click({timeout:5000});report.steps.push({action:'click',name});};
  const select=async id=>{assert.equal(await slot(id).count(),1);const rect=await readRect(slot(id));check(`${id} is fully inside viewport before selection`,rectInside(rect,viewport()),rect);await slot(id).click();report.steps.push({action:'select',id});return settle(r=>r.view.selectedId===id,`select ${id}`);};
  const menuNames=['menu_save','menu_load','menu_reward'];
  const sortNames=['sort_default','sort_name','sort_rarity','sort_price','sort_quantity'];
  const openMenu=async()=>{await click('menu');await control('menu_save').waitFor({state:'visible'});await inViewport(menuNames,'all storage and rewards menu items fit the current viewport');};
  const storage=async name=>{await openMenu();await click(name);};
  const fontFacts=()=>page.locator('[data-testid="inventory"] .fgui-text,[data-testid="inventory"] input,[data-testid="inventory"] textarea').evaluateAll(nodes=>nodes.flatMap(node=>{
   const style=getComputedStyle(node),rect=node.getBoundingClientRect();
   if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0||!rect.width||!rect.height||!(node.innerText||node.value||node.placeholder||'').trim())return[];
   let sx=1,sy=1;for(let current=node;current;current=current.parentElement){const transform=getComputedStyle(current).transform;if(transform!=='none'){const matrix=new DOMMatrixReadOnly(transform);sx*=Math.hypot(matrix.a,matrix.b);sy*=Math.hypot(matrix.c,matrix.d);}}
   const cssFont=parseFloat(style.fontSize);
   return[{name:node.closest('[data-testid]')?.dataset.testid,text:(node.innerText||node.value||node.placeholder||'').slice(0,80),cssFont,effectiveFont:cssFont*Math.min(sx,sy),scaleX:sx,scaleY:sy,rect:rect.toJSON()}];
  }));
  const cells=()=>page.locator('[data-item-id]').evaluateAll(nodes=>nodes.map(node=>{const rect=node.getBoundingClientRect(),hit=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);return{id:node.dataset.itemId,rect:rect.toJSON(),centerHit:hit?.closest('[data-item-id]')?.dataset.itemId,texts:[...node.querySelectorAll('.fgui-text')].map(text=>text.innerText.trim()).filter(Boolean),quantityRects:[...node.querySelectorAll('[data-testid="quantity"]')].map(field=>field.getBoundingClientRect().toJSON())};}));
  const imageFacts=locator=>locator.evaluate(root=>[root,...root.querySelectorAll('*')].flatMap(node=>{const style=getComputedStyle(node),rect=node.getBoundingClientRect();const urls=[];if(node instanceof HTMLImageElement&&node.currentSrc)urls.push(node.currentSrc);for(const match of style.backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g))urls.push(new URL(match[1],location.href).href);return urls.map(url=>({url,rect:rect.toJSON(),backgroundSize:style.backgroundSize,tag:node.tagName,childCount:node.children.length}));}));
  const inspectAlpha=async(locator,name)=>{
   const image=(await imageFacts(locator)).find(image=>image.rect.width>0&&image.rect.height>0);assert(image,`Rendered image for ${name}`);local(image.url);
   const response=await fetch(image.url,{signal:AbortSignal.timeout(5000)});assert(response.ok);
   const bytes=Buffer.from(await response.arrayBuffer()),{data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   const corners=[[0,0],[info.width-1,0],[0,info.height-1],[info.width-1,info.height-1]].map(([x,y])=>data[(y*info.width+x)*4+3]);let transparent=0;for(let index=3;index<data.length;index+=4)if(data[index]===0)transparent++;
   const assetKey=await locator.getAttribute('data-skin-asset'),asset=manifest.assets[assetKey];
   const fact={name,assetKey,...image,width:info.width,height:info.height,bytes:bytes.length,sha256:sha256(bytes),transparentPixels:transparent,cornerAlpha:corners};
   check(`${name}: actual adaptive ornament uses its Alpha asset`,assetKey?.endsWith('Alpha')&&image.url===new URL(asset.file,url).href&&new URL(image.url).pathname.includes('Alpha'),fact);
   check(`${name}: actual ornament has transparent background and preserves image ratio`,transparent>0&&corners.every(alpha=>alpha===0)&&Math.abs((image.rect.width/image.rect.height)/(info.width/info.height)-1)<.01,fact);return fact;
  };
  const inspectGroups=async label=>{
   const groups=[];
   for(const [buttonName,iconName]of [['primary','compass'],['sell','sellCoins']]){
    const buttonRect=await readRect(control(buttonName)),icon=await inspectAlpha(control(iconName),`${label}-${iconName}`);
    const text=await control(buttonName+'-label').evaluate(element=>{const span=element.querySelector('.fgui-text')||element,range=document.createRange();range.selectNodeContents(span);return{value:span.textContent,rect:range.getBoundingClientRect().toJSON()};});
    const left=Math.min(icon.rect.x,text.rect.x),right=Math.max(icon.rect.right,text.rect.right),delta=(left+right)/2-(buttonRect.x+buttonRect.width/2);
    const group={buttonName,buttonRect,icon,text,groupLeft:left,groupRight:right,centerDelta:delta,roundedDevicePixelDelta:Math.round(delta),centerTolerance:'2px after rounding to the nearest device pixel at deviceScaleFactor=1; raw CSS subpixel delta is retained.',gap:text.rect.x-icon.rect.right};groups.push(group);
    check(`${label}-${buttonName}: visible icon and text form a centered nonoverlapping group`,Math.abs(group.roundedDevicePixelDelta)<=2&&text.rect.x>=icon.rect.right&&left>=buttonRect.x&&right<=buttonRect.right,group);
   }return groups;
  };
  const expandFour=values=>values.length===1?Array(4).fill(values[0]):values.length===2?[values[0],values[1],values[0],values[1]]:values.length===3?[values[0],values[1],values[2],values[1]]:values;
  const inspectNineSlice=async label=>{
   const slices=await page.locator('[data-skin-asset]').evaluateAll(nodes=>nodes.flatMap(node=>{const style=getComputedStyle(node),rect=node.getBoundingClientRect();if(!rect.width||!rect.height||style.display==='none'||style.visibility==='hidden'||style.borderImageSource==='none')return[];return[{name:node.dataset.testid,asset:node.dataset.skinAsset,rect:rect.toJSON(),slice:style.borderImageSlice,width:style.borderImageWidth,repeat:style.borderImageRepeat,border:[style.borderTopWidth,style.borderRightWidth,style.borderBottomWidth,style.borderLeftWidth].map(parseFloat)}];}));
   check(`${label}: real search tabs buttons and frame skins use their art insets`,['searchBg','tabSelectedBg','tabNormalBg','primaryBg','secondaryBg','sortBg','frameLeft','frameRight'].every(key=>slices.some(slice=>slice.asset===key)),slices);
   for(const slice of slices){
    const asset=manifest.assets[slice.asset];assert(asset,`Declared art ${slice.asset}`);const actual=expandFour(slice.slice.replace('fill','').trim().split(/\s+/).map(Number)),expected=asset.insets;
    check(`${label}-${slice.name}: source and destination caps leave a nonempty center`,Array.isArray(expected)&&JSON.stringify(actual)===JSON.stringify(expected)&&asset.width-actual[1]-actual[3]>0&&asset.height-actual[0]-actual[2]>0&&slice.rect.width-slice.border[1]-slice.border[3]>0&&slice.rect.height-slice.border[0]-slice.border[2]>0,{...slice,expected,natural:{width:asset.width,height:asset.height}});
   }
   return slices;
  };
  const inspectFramePaint=async(label,name)=>{
   const locator=control(name),rect=await readRect(locator);
   const border=await locator.evaluate(element=>{const s=getComputedStyle(element);return[s.borderTopWidth,s.borderRightWidth,s.borderBottomWidth,s.borderLeftWidth].map(parseFloat);});
   const visible=await page.screenshot();let hidden;const original=await locator.evaluate(element=>element.style.borderImageSource);
   try{await locator.evaluate(element=>{element.style.borderImageSource='none';});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));hidden=await page.screenshot();}
   finally{await locator.evaluate((element,source)=>{element.style.borderImageSource=source;},original);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
   const a=await sharp(visible).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=await sharp(hidden).ensureAlpha().raw().toBuffer();
   const start=Math.ceil(rect.y+border[0]),end=Math.floor(rect.bottom-border[2]),left=Math.ceil(rect.x),right=Math.floor(rect.right);let leftRows=0,rightRows=0;
   const changed=(x,y)=>{const index=(y*a.info.width+x)*4;return a.data[index]!==b[index]||a.data[index+1]!==b[index+1]||a.data[index+2]!==b[index+2]||a.data[index+3]!==b[index+3];};
   for(let y=start;y<end;y++){let l=false,r=false;for(let x=left;x<Math.ceil(rect.x+border[3]);x++)l||=changed(x,y);for(let x=Math.floor(rect.right-border[1]);x<right;x++)r||=changed(x,y);if(l)leftRows++;if(r)rightRows++;}
   const facts={name,rect,border,centerRows:end-start,leftRows,rightRows,method:'In this isolated test page only, capture visible frame then temporarily disable only borderImageSource; restore before any input. Every middle-edge row must show painted pixels, excluding corner caps.'};
   await fs.writeFile(path.join(output,`${label}-${name}-paint-visible.png`),visible);await fs.writeFile(path.join(output,`${label}-${name}-diagnostic-border-disabled.png`),hidden);
   check(`${label}-${name}: both panel side borders actually paint the full center height`,end>start&&leftRows===end-start&&rightRows===end-start,facts);return facts;
  };
  const inspectAdaptiveArt=async label=>{const result={label,viewport:viewport(),slices:await inspectNineSlice(label),groups:await inspectGroups(label),framePaint:[]};for(const name of ['frameLeft','frameRight'])result.framePaint.push(await inspectFramePaint(label,name));report.controlArt.push(result);await capture(`${label}-controls`);};

  const initial=await read(),initialBusiness=JSON.parse(initial.rawTsResponse);
  report.initial=initial;await fs.writeFile(path.join(output,'initial-snapshot.json'),JSON.stringify(initial,null,2));
  // Freeze the unmodified adaptive page before any select, use, menu or sort action.
  await capture('initial-754x743');
  check('real local FairyGUI DOM without canvas or iframe',await page.locator('.fgui-stage').count()===1&&await page.locator('canvas,iframe').count()===0&&report.requests.some(request=>/fairygui[^/]*\.js/.test(request.url)&&request.status===200));
  check('target viewport is 754x743 with native scale one',initial.ui.screenWidth===754&&initial.ui.screenHeight===743&&initial.ui.fidelity.scale===1,initial.ui.fidelity);
  const rootTransform=await control('inventory').evaluate(element=>{const style=getComputedStyle(element),matrix=new DOMMatrixReadOnly(style.transform==='none'?undefined:style.transform);return{transform:style.transform,scaleX:Math.hypot(matrix.a,matrix.b),scaleY:Math.hypot(matrix.c,matrix.d),rect:element.getBoundingClientRect().toJSON()};});
  check('actual root CSS transform preserves native scale',Math.abs(rootTransform.scaleX-1)<1e-8&&Math.abs(rootTransform.scaleY-1)<1e-8,rootTransform);
  check('adaptive page begins with the shared 24-stack fixture',initialBusiness.view.usedSlots===24&&initialBusiness.view.visible.length===24&&initialBusiness.view.coins===12480&&initialBusiness.view.selectedId==='sword-1'&&initial.ui.virtualList===false&&initialBusiness.session.listenerCount===1);
  const initialCells=await cells();report.initialCells=initialCells;
  check('24 real cells form four columns and six rows',initialCells.length===24&&new Set(initialCells.map(cell=>cell.rect.x.toFixed(1))).size===4&&new Set(initialCells.map(cell=>cell.rect.y.toFixed(1))).size===6,initialCells);
  check('every cell is fully visible and its center is hit-testable',initialCells.every(cell=>rectInside(cell.rect,viewport())&&cell.centerHit===cell.id),initialCells.map(({id,rect,centerHit})=>({id,rect,centerHit})));
  check('quantity fields stay completely within their own cells',initialCells.every(cell=>cell.quantityRects.length===1&&cell.quantityRects.every(r=>r.x>=cell.rect.x-.01&&r.y>=cell.rect.y-.01&&r.right<=cell.rect.right+.01&&r.bottom<=cell.rect.bottom+.01)),initialCells.map(({id,rect,quantityRects})=>({id,rect,quantityRects})));
  for(const item of initialBusiness.view.items){const actual=initialCells.find(cell=>cell.id===item.id);check(`${item.id} uses real quantity and no grid name label`,actual&&actual.texts.some(text=>/^[×x]?\s*\d+$/.test(text)&&numeric(text)===item.quantity)&&!actual.texts.some(text=>text.includes(item.name)),actual?.texts);}
  const fonts=await fontFacts();report.initialFonts=fonts;
  check('all visible body text has effective font at least 16px',fonts.length>24&&fonts.every(font=>font.effectiveFont>=16-.001),fonts.filter(font=>font.effectiveFont<16-.001));
  const panes=await page.locator('[data-testid="frameLeft"],[data-testid="frameRight"],[data-testid="panel-fill-left"],[data-testid="panel-fill-right"],[data-testid="adaptive-grid-panel"],[data-testid="adaptive-detail-panel"]').evaluateAll(nodes=>nodes.flatMap(node=>{const rect=node.getBoundingClientRect(),style=getComputedStyle(node);return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>100&&rect.height>200?[{name:node.dataset.testid,rect:rect.toJSON()}]:[];}));
  const listRect=await readRect(control('list'));
  const paneRects=panes.length?panes.map(pane=>pane.rect):[listRect];
  const paneTop=Math.min(...paneRects.map(rect=>rect.y)),paneBottom=Math.max(...paneRects.map(rect=>rect.y+rect.height));
  report.mainPane={panes,listRect,top:paneTop,bottom:paneBottom};
  check('main pane fills height without large top and bottom letterboxes',paneTop<140&&paneBottom>viewport().height-100,report.mainPane);
  await inspectAdaptiveArt('adaptive-754x743-initial');

  const reference=JSON.parse(await fs.readFile(path.join(here,'layout-reference.json'),'utf8'));
  const inspectDetail=async id=>{
   const response=await select(id);await page.waitForTimeout(120);
   const images=await control('detailIcon').evaluate(root=>[root,...root.querySelectorAll('*')].flatMap(node=>{const style=getComputedStyle(node),rect=node.getBoundingClientRect();const urls=[];if(node instanceof HTMLImageElement&&node.currentSrc)urls.push(node.currentSrc);for(const match of style.backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g))urls.push(new URL(match[1],location.href).href);return urls.map(url=>({url,rect:rect.toJSON(),backgroundSize:style.backgroundSize,tag:node.tagName,childCount:node.children.length}));}));
   assert(images.length,`Actual rendered detail image for ${id}`);
   const used=images.find(image=>image.rect.width>0&&image.rect.height>0);local(used.url);
   const fetched=await fetch(used.url,{signal:AbortSignal.timeout(5000)});assert(fetched.ok);
   const bytes=Buffer.from(await fetched.arrayBuffer()),{data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   let transparent=0,edgeOpaque=0;for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const alpha=data[(y*info.width+x)*4+3];if(alpha===0)transparent++;if((x===0||y===0||x===info.width-1||y===info.height-1)&&alpha!==0)edgeOpaque++;}
   const cornerAlpha=[[0,0],[info.width-1,0],[0,info.height-1],[info.width-1,info.height-1]].map(([x,y])=>data[(y*info.width+x)*4+3]);
   const source=reference.slots.find(slot=>slot.kind===response.view.selected.kind),tile=manifest.assets[source?.asset||`slot${String(response.view.selected.iconIndex).padStart(2,'0')}`];
   const tileBytes=await fs.readFile(path.join(here,tile.file));
   const actual={id,kind:response.view.selected.kind,...used,bytes:bytes.length,width:info.width,height:info.height,sha256:sha256(bytes),gridTileSha256:sha256(tileBytes),transparentPixels:transparent,edgeOpaquePixels:edgeOpaque,cornerAlpha,renderedAspect:used.rect.width/used.rect.height,naturalAspect:info.width/info.height,presentation:(await read()).ui.detail};
   const entry=detailManifest.entries.find(entry=>entry.index===response.view.selected.iconIndex);actual.manifestEntry=entry;
   report.detailImages.push(actual);
   check(`${id} presents the manifest-declared standalone detail asset`,entry&&used.url===new URL(entry.file,url).href&&sha256(bytes)===report.sourceFiles.find(source=>source.file===entry.file)?.sha256&&actual.presentation?.source==='derived-transparent-item'&&actual.presentation.url===used.url&&actual.presentation.preserveAspect===true&&actual.presentation.naturalSize.width===info.width&&actual.presentation.naturalSize.height===info.height,{entry,presentation:actual.presentation});
   // Item artwork may touch an image edge. That does not imply a slot frame or quantity glyph.
   check(`${id} detail uses an independent alpha image with transparent corners`,sha256(bytes)!==sha256(tileBytes)&&transparent>0&&cornerAlpha.every(alpha=>alpha===0),actual);
   check(`${id} detail preserves natural aspect ratio`,Math.abs(actual.renderedAspect/actual.naturalAspect-1)<.01,{renderedAspect:actual.renderedAspect,naturalAspect:actual.naturalAspect,note:'1% allows CSS/pixel rounding; it is not a visual likeness threshold.'});
   check(`${id} detail has no quantity DOM overlay`,await control('detailIcon').locator('[data-testid="quantity"],.fgui-text').count()===0);
   await capture(`detail-${id}-${viewport().width}x${viewport().height}`);
   return response;
  };
  const clickButtonText=async name=>{
   const buttonRect=await readRect(control(name)),textRect=await control(name+'-label').evaluate(element=>{const range=document.createRange();range.selectNodeContents(element.querySelector('.fgui-text')||element);return range.getBoundingClientRect().toJSON();});
   const position={x:textRect.x+textRect.width/2-buttonRect.x,y:textRect.y+textRect.height/2-buttonRect.y};
   check(`${name}: actual text center is inside its button hit area`,position.x>0&&position.x<buttonRect.width&&position.y>0&&position.y<buttonRect.height,{buttonRect,textRect,position});
   await control(name).click({position});report.steps.push({action:'click-at-visible-text-center',name,position});
  };
  await inspectDetail('ring-1');await inspectGroups('adaptive-ring-two-character-label');
  await clickButtonText('primary');let ring=await settle(r=>r.view.equipment.ring?.id==='ring-1','equip ring at visible text');
  check('actual visible equipment text click equips the selected ring',ring.ok&&ring.view.usedSlots===23&&ring.view.selected.equipped);
  await clickButtonText('primary');ring=await settle(r=>r.view.equipment.ring===null&&r.view.usedSlots===24,'unequip ring at visible text');
  check('actual visible unequip text click returns stable ring',ring.ok&&ring.view.selected.id==='ring-1'&&!ring.view.selected.equipped);
  await inspectDetail('key-1');await inspectGroups('adaptive-quest-four-character-label');await inspectDetail('redPotion-1');
  await click('primary');let current=await settle(r=>r.view.selected?.quantity===7,'use potion');
  check('actual use consumes exactly one and updates visible quantity',current.ok&&(await slot('redPotion-1').innerText()).includes('7'));
  const beforeSale=normalized(current.view);
  await click('sell');await control('confirm').waitFor({state:'visible'});
  await inViewport(['confirm','cancel'],'both real sell-confirm buttons fit viewport');await capture('sell-confirm-754x743');
  check('opening sell confirmation leaves shared state unchanged',JSON.stringify(normalized((await business()).view))===JSON.stringify(beforeSale));
  await click('cancel');check('real cancel preserves shared state and removes popup',JSON.stringify(normalized((await business()).view))===JSON.stringify(beforeSale)&&!(await read()).ui.popup);
  await click('sell');await inViewport(['confirm','cancel'],'sell confirmation remains in viewport when reopened');await click('confirm');
  current=await settle(r=>r.view.selected?.quantity===6&&r.view.coins===12492,'confirm potion sale');
  check('real sale confirmation consumes one and credits exact price',current.ok&&numeric(await control('coins').innerText())===12492);
  const saved=normalized(current.view);
  await openMenu();await capture('storage-menu-754x743');await click('menu_save');
  await click('primary');await settle(r=>r.view.selected?.quantity===5,'use after save');await storage('menu_load');current=await settle(r=>r.view.selected?.quantity===6,'load saved state');
  check('anchored menu save/load restores full actual business state',current.ok&&JSON.stringify(normalized(current.view))===JSON.stringify(saved));
  report.storage=await page.evaluate(()=>Object.entries(localStorage).map(([key,value])=>({key,bytes:value.length})));
  check('save writes actual local storage',report.storage.length>0);
  await click('sort');await inViewport(sortNames,'all five real sorting choices fit viewport');await capture('sort-menu-754x743');await click('sort_name');current=await settle(r=>r.view.sort==='name','name sort');
  check('anchored sort menu changes actual business order',current.view.visible.every((item,index,items)=>index===0||items[index-1].name<=item.name));
  await storage('menu_reward');await inViewport(['confirm','cancel','reward-progress','reward-claim'],'all reward popup buttons fit viewport');await capture('reward-popup-754x743');
  const rewardBefore=(await business()).view;await click('reward-progress');current=await settle(r=>r.view.rewards.items.every(item=>item.state!=='locked'),'reward progress');
  check('real adaptive reward progress uses shared rules',current.ok&&current.view.rewards.items.filter(item=>item.state==='ready').length>rewardBefore.rewards.items.filter(item=>item.state==='ready').length);
  await inViewport(['confirm','cancel','reward-progress','reward-claim'],'rebuilt reward popup remains anchored inside viewport');
  const claimBefore=current.view;await click('reward-claim');current=await settle(r=>r.view.coins===claimBefore.coins+10,'reward claim');
  check('real adaptive reward claim credits ten coins',current.ok&&current.view.rewards.items.filter(item=>item.state==='claimed').length===claimBefore.rewards.items.filter(item=>item.state==='claimed').length+1);
  await click('cancel');
  const preserved=await business();
  for(const size of [{width:1024,height:768},{width:754,height:743},{width:820,height:743},{width:754,height:743}]){
   await page.setViewportSize(size);await page.waitForFunction(size=>{const s=window.complexVerification.snapshot();return s.ui.screenWidth===size.width&&s.ui.screenHeight===size.height;},size);await page.waitForTimeout(100);
   const snapshot=await read(),actual=JSON.parse(snapshot.rawTsResponse);report.layouts.push({viewport:size,ui:snapshot.ui,session:actual.session,revision:actual.view.revision});
   check(`resize ${size.width}x${size.height} preserves business and one listener`,JSON.stringify(normalized(actual.view))===JSON.stringify(normalized(preserved.view))&&actual.session.listenerCount===1&&actual.session.closedCallbacks===0&&actual.session.listenerErrors===0,{session:actual.session,revision:actual.view.revision});
  }
  const resized=await read();check('return to target retains native scale',resized.ui.fidelity.scale===1,resized.ui.fidelity);
  await openMenu();await inViewport(menuNames,'storage menu stays anchored after repeated resize');await click('menu');
  await click('sort');await inViewport(sortNames,'sorting menu stays anchored after repeated resize');await click('sort_default');await settle(r=>r.view.sort==='default','restore default order');
  const beforePending=await business();await click('sell');await control('confirm').waitFor({state:'visible'});
  await page.setViewportSize({width:820,height:743});await page.waitForTimeout(150);const pending=await read();
  check('resize dismisses an unconfirmed sale without committing business',!pending.ui.popup&&!pending.ui.menu&&JSON.stringify(normalized(JSON.parse(pending.rawTsResponse).view))===JSON.stringify(normalized(beforePending.view))&&JSON.parse(pending.rawTsResponse).session.listenerCount===1);
  await page.setViewportSize({width:754,height:743});await page.waitForTimeout(150);
  check('post-resize adaptive grid still exposes all 24 usable cells',(await cells()).length===24&&(await cells()).every(cell=>rectInside(cell.rect,viewport())&&cell.centerHit===cell.id));
  await page.setViewportSize({width:794,height:727});await page.waitForTimeout(180);
  const beforeAdditional=await business(),liveCells=await cells();
  check('794x727 live-sized adaptive layout exposes a complete four-by-six grid',liveCells.length===24&&new Set(liveCells.map(cell=>cell.rect.x.toFixed(1))).size===4&&new Set(liveCells.map(cell=>cell.rect.y.toFixed(1))).size===6&&liveCells.every(cell=>rectInside(cell.rect,viewport())&&cell.centerHit===cell.id));
  await inspectDetail('ring-1');await inspectAdaptiveArt('adaptive-794x727-ring');
  await click('sort');await inViewport(sortNames,'794x727 sorting choices remain fully in viewport');await capture('794x727-sort-menu');await click('sort_default');
  await openMenu();await capture('794x727-storage-menu');await click('menu');
  const before794Sale=await business();await click('sell');await inViewport(['confirm','cancel'],'794x727 sell confirmation buttons stay in viewport');await capture('794x727-sell-confirm');await click('cancel');
  check('794x727 modal cancellation preserves actual business',JSON.stringify(normalized((await business()).view))===JSON.stringify(normalized(before794Sale.view)));
  await page.setViewportSize({width:1586,height:992});await page.waitForTimeout(180);await select('sword-1');
  const canonical=await read(),canonicalBusiness=JSON.parse(canonical.rawTsResponse),canonicalCells=await cells();
  check('canonical 1586x992 retains native scale and its complete six-by-four grid',canonical.ui.fidelity.scale===1&&canonical.ui.fidelity.mode==='canonical'&&canonicalCells.length===24&&new Set(canonicalCells.map(cell=>cell.rect.x.toFixed(1))).size===6&&new Set(canonicalCells.map(cell=>cell.rect.y.toFixed(1))).size===4&&canonicalCells.every(cell=>rectInside(cell.rect,viewport())&&cell.centerHit===cell.id));
  check('canonical sword still shows the real three shared attributes',canonicalBusiness.view.selected.stats.attack===48&&canonicalBusiness.view.selected.stats.crit===6&&canonicalBusiness.view.selected.stats.durability===100);
  await inViewport(['primary','sell','sort','menu'],'canonical basic controls remain inside viewport');
  for(const name of ['compass','sellCoins']){const image=(await imageFacts(control(name))).find(image=>image.rect.width>0);check(`canonical ${name} preserves its original reference ornament`,image?.url===new URL(manifest.assets[name].file,url).href,image);}
  report.layouts.push({viewport:{width:794,height:727},initialSession:beforeAdditional.session},{viewport:{width:1586,height:992},ui:canonical.ui,session:canonicalBusiness.session});await capture('canonical-basic-1586x992');
  await page.setViewportSize({width:754,height:743});await page.waitForTimeout(180);
  const final=await read();report.final=final;await fs.writeFile(path.join(output,'final-snapshot.json'),JSON.stringify(final,null,2));await capture('after-controls-and-resize-754x743');
  check('all resources remain local and successful',report.blockedExternal.length===0&&report.requestFailures.length===0&&report.requests.every(request=>request.status<400),{blocked:report.blockedExternal,failures:report.requestFailures});
  check('no browser or host errors',report.errors.length===0&&final.errors.length===0,{browser:report.errors,host:final.errors});
  report.completedSourceFiles=await Promise.all(report.sourceFiles.map(async item=>({...item,completedSha256:sha256(await fs.readFile(path.join(here,item.file)))})));
  check('source artifacts stayed unchanged throughout this run',report.completedSourceFiles.every(item=>item.sha256===item.completedSha256),report.completedSourceFiles);
  report.functionalStatus='passed';report.visualStatus='not-assessed';report.status='passed';
 }catch(error){
  report.status='failed';report.failure={message:String(error),stack:error.stack};
  if(page&&!page.isClosed()){try{report.failureSnapshot=await page.evaluate(()=>window.complexVerification?.snapshot());}catch(readError){report.failureReadError=String(readError);}try{const file=path.join(output,'failure.png');await page.screenshot({path:file});report.screenshots.push({name:'failure',file,viewport:page.viewportSize()});}catch(captureError){report.failureCaptureError=String(captureError);}}
 }finally{
  if(context)await context.close();if(browser)await browser.close();report.completedAt=new Date().toISOString();
  const file=path.join(output,'result.json');await fs.writeFile(file,JSON.stringify(report,null,2));
  console.log(JSON.stringify({status:report.status,functionalStatus:report.functionalStatus,visualStatus:report.visualStatus,checks:report.checks.map(({name,passed})=>({name,passed})),failure:report.failure,output:file},null,2));
 }
 return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const result=await runAdaptiveAcceptance();process.exitCode=result.status==='passed'?0:1;}
