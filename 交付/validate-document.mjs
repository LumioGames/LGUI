import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const here=path.dirname(fileURLToPath(import.meta.url));
const {chromium}=createRequire(import.meta.url)('playwright');
const output=path.join(here,'文档检查');await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
const errors=[],external=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route(/^https?:/,route=>{external.push(route.request().url());return route.abort();});
const target=pathToFileURL(path.join(here,'FairyGUI-跨端UI方案与最佳实践.html')).href;
await page.goto(target,{waitUntil:'load'});
await page.evaluate(()=>Promise.all([...document.querySelectorAll('figure img')].map(i=>i.decode())));
const basics=await page.evaluate(()=>({
 title:document.title,lang:document.documentElement.lang,chapters:document.querySelectorAll('main>section').length,
 images:[...document.images].filter(i=>i.closest('figure')).map(i=>({width:i.naturalWidth,height:i.naturalHeight,alt:i.alt,inline:i.src.startsWith('data:')})),
 badAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash),
 textCharacters:document.body.innerText.length,localLinks:document.querySelectorAll('[data-local-reference]').length,
 externalAssets:[...document.querySelectorAll('script[src],link[rel="stylesheet"]')].map(e=>e.src||e.href),
}));
const viewports=[];
for(const [width,height] of [[1440,1100],[794,900],[390,844]]){
 await page.setViewportSize({width,height});await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:path.join(output,`文档-${width}.png`)});
 const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,bodyWidth:document.body.getBoundingClientRect().width}));
 if(layout.scrollWidth>width+1)throw Error(`Document horizontal overflow ${width}: ${layout.scrollWidth}`);
 viewports.push({width,height,...layout});
}
await page.setViewportSize({width:1440,height:1100});
await page.locator('#visuals').scrollIntoViewIfNeeded();
await page.screenshot({path:path.join(output,'文档-参考与实现.png')});
await page.locator('#pitfalls').scrollIntoViewIfNeeded();
await page.screenshot({path:path.join(output,'文档-踩坑.png')});
await page.locator('.reference-figure .image-button').click();
if(!await page.locator('#image-dialog').evaluate(e=>e.open))throw Error('Image dialog did not open');
await page.keyboard.press('Escape');
await page.locator('#toggle-details').click();
if(!await page.locator('details').evaluateAll(nodes=>nodes.every(d=>d.open)))throw Error('Expand all failed');
await page.locator('#toggle-details').click();
if(!await page.locator('details').evaluateAll(nodes=>nodes.every(d=>!d.open)))throw Error('Collapse all failed');
await page.pdf({path:path.join(output,'文档打印检查.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
if(basics.badAnchors.length||errors.length||external.length||basics.externalAssets.length)throw Error(JSON.stringify({errors,external,basics}));
if(basics.images.length!==5||basics.images.some(i=>i.width===0||!i.inline))throw Error('Inline image integrity failed');
const result={status:'passed',scope:'HTML artifact only; no game or Unity tests executed',...basics,viewports,errors,externalRequests:external,interactions:{imageDialog:true,escapeToClose:true,expandCollapseAll:true},printGenerated:true};
await fs.writeFile(path.join(output,'result.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
} finally {await browser.close();}
