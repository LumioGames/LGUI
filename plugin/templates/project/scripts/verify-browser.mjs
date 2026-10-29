import {chromium} from '../node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import assert from 'node:assert/strict';
const args=process.argv.slice(2),i=args.indexOf('--browser'),channel=i<0?'chrome':args[i+1];if(!['chrome','msedge'].includes(channel))throw Error('Use --browser chrome|msedge.');
const dir=path.join(process.env.LGUI_WORKSPACE,'evidence/browser-'+Date.now());await fs.mkdir(dir,{recursive:true});const browser=await chromium.launch({channel,headless:true});
try{const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(String(error)));let checks=0;
 for(const [width,height] of [[1200,800],[390,844]]){await page.setViewportSize({width,height});await page.goto(`http://127.0.0.1:${process.env.LGUI_WEB_PORT}/`);await page.getByTestId('ui-title').waitFor();assert.equal(await page.getByTestId('ui-title').textContent(),'UI project');checks++;const box=await page.getByTestId('ui-title').boundingBox();assert(box.x===24&&box.width===width-48&&box.height===80);checks++;await page.screenshot({path:path.join(dir,`${width}x${height}.png`)});}
 assert.deepEqual(errors,[]);checks++;await fs.writeFile(path.join(dir,'report.json'),JSON.stringify({status:'passed',version:browser.version(),channel,checks,scope:'Blank UI smoke and actual geometry; author project-specific interaction/persistence assertions as the UI grows.'},null,2));console.log(JSON.stringify({status:'passed',checks,evidence:dir}));
}finally{await browser.close();}
