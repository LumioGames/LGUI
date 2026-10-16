import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url));
const sharp=createRequire(path.resolve(root,'../../../toolchain-test/package.json'))('sharp');
const source=path.join(root,'alpha/items-details-v2.png');const metadata=await sharp(source).metadata();
if(metadata.width!==1536||metadata.height!==1024||!metadata.hasAlpha)throw Error('Expected transparent 6x4 256px sprite atlas');
const hash=b=>createHash('sha256').update(b).digest('hex');
const alphaThreshold=8,padding=2;
async function writeChanged(file,bytes){const old=await fs.readFile(file).catch(e=>{if(e.code==='ENOENT')return null;throw e;});if(!old||!old.equals(bytes))await fs.writeFile(file,bytes);}
function alphaBounds(data,width,height){let left=width,top=height,right=-1,bottom=-1;for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>=alphaThreshold){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}if(right<0)throw Error('No visible sprite pixels');return {left,top,width:right-left+1,height:bottom-top+1};}
const entries=[];
await fs.mkdir(path.join(root,'trimmed'),{recursive:true});
for(let i=0;i<24;i++){
 // The generated rows do not end exactly at the nominal 256px grid lines:
 // first-row handles/shields extend to y~274, while second-row objects begin
 // below y~300. Preserve complete objects and exclude neighboring fragments.
 const row=Math.floor(i/6),starts=[0,288,528,768],ends=[288,528,768,1024];
 const rect={left:(i%6)*256,top:starts[row],width:256,height:ends[row]-starts[row]};
 const bytes=await sharp(source).extract(rect).png().toBuffer();const originalFile=`alpha/detail-${String(i).padStart(2,'0')}.png`;await writeChanged(path.join(root,originalFile),bytes);
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});const bounds=alphaBounds(data,info.width,info.height);
 const left=Math.max(0,bounds.left-padding),top=Math.max(0,bounds.top-padding),right=Math.min(info.width,bounds.left+bounds.width+padding),bottom=Math.min(info.height,bounds.top+bounds.height+padding);
 const trimRect={left,top,width:right-left,height:bottom-top};const trimmed=await sharp(bytes).extract(trimRect).png().toBuffer();
 const file=`trimmed/detail-${String(i).padStart(2,'0')}.png`;await writeChanged(path.join(root,file),trimmed);
 entries.push({index:i,file,width:trimRect.width,height:trimRect.height,sha256:hash(trimmed),originalFile,originalSha256:hash(bytes),originalWidth:info.width,originalHeight:info.height,rect,alphaBounds:bounds,alphaThreshold,padding,trimRect,trimmedSourceRect:{left:rect.left+left,top:rect.top+top,width:trimRect.width,height:trimRect.height},pixelOperation:'Exact rectangular crop only; no resampling, repainting, alpha replacement or aspect-ratio changes.'});
}
const report={source:'alpha/items-details-v2.png',sourceSha256:hash(await fs.readFile(source)),width:metadata.width,height:metadata.height,hasAlpha:metadata.hasAlpha,alphaThreshold,padding,entries,note:'For interactive detail images. file points to a tightly cropped sprite; originalFile preserves the original cell. Alpha >=8 ignores faint generated background noise when locating the subject. Native quantities and frames are separate UI; preserve actual width/height aspect ratio.'};
await fs.writeFile(path.join(root,'detail-icons.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({sprites:entries.length,hasAlpha:metadata.hasAlpha,sha256:report.sourceSha256}));
