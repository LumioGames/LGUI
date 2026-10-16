import path from 'node:path';
import {promises as fs} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const here=path.dirname(fileURLToPath(import.meta.url));
const referencePath=path.resolve(here,'../art/reference.png');
const require=createRequire(path.resolve(here,'../../../toolchain-test/package.json'));
const sharp=require('sharp');
const reference=await fs.readFile(referencePath);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const metadata=await sharp(reference).metadata();
assert.equal(metadata.width,1586);assert.equal(metadata.height,992);
const R=(x,y,width,height)=>({x,y,width,height});
const sharpRect=r=>({left:r.x,top:r.y,width:r.width,height:r.height});
const manifest={schemaVersion:1,status:'preparing',reference:{file:'../art/reference.png',width:1586,height:992,sha256:sha(reference)},assets:{},notes:[
 'All art is sliced from the existing generated reference. No full-screen reference background is produced.',
 'Slot crops contain original quantity glyphs: cover quantityRect with an opaque UI patch and render native variable text.',
 'Header branding is explicitly decorative raster lettering; other body/button text is native and editable.',
 'Frame centers are zero RGBA, not hidden copies of reference controls. Buttons reconstruct their semantic center from a blank texture crop.',
 'Rectangles are integer source-pixel bounds chosen from the visible reference; first-pass visual review is still required.'
]};
const layout={schemaVersion:1,design:{width:1586,height:992},referenceSha256:sha(reference),panels:{left:R(132,137,879,723),right:R(1017,137,433,723),footer:R(132,870,1318,74)},controls:{
 headerBranding:R(132,26,420,99),coin:R(1113,17,45,45),coins:R(1164,23,132,38),close:R(1372,19,39,39),
 search:R(149,155,299,46),searchIcon:R(165,165,29,29),searchText:R(207,165,219,30),
 tab_all:R(466,156,99,45),tab_equipment:R(571,156,101,45),tab_consumable:R(678,156,101,45),tab_material:R(784,156,101,45),tab_quest:R(890,156,96,45),
 list:R(149,222,832,597),detailIcon:R(1040,150,194,392),detailTitle:R(1258,190,166,42),rarity:R(1259,238,165,30),detailDivider:R(1230,291,188,15),
 stats:R(1233,337,188,153),description:R(1047,564,374,85),primary:R(1047,685,370,65),sell:R(1047,763,370,65),
 primaryIcon:R(1162,701,44,39),primaryText:R(1229,699,85,39),sellIcon:R(1163,779,43,33),sellText:R(1230,776,85,39),
 capacityIcon:R(155,891,35,36),summary:R(201,894,92,35),progress:R(293,895,420,24),sort:R(1141,883,216,49),menu:R(1404,890,34,38),footerHint:R(560,949,520,25)
},slots:[],detail:{title:'霜纹长剑',rarity:'稀有 · 武器',stats:[{label:'攻击',value:'+48',icon:'statAttack',labelRect:R(1274,340,80,33),valueRect:R(1362,339,57,35)},{label:'暴击',value:'+6%',icon:'statCrit',labelRect:R(1274,399,80,33),valueRect:R(1362,398,57,35)},{label:'耐久',value:'100',icon:'statDurability',labelRect:R(1274,458,80,33),valueRect:R(1362,457,57,35)}],description:'剑身流转着如霜的纹路，\n仿佛封存了北境的寒风。\n它曾陪伴无数旅者穿越黑暗，迎向黎明。'},footer:{referenceCapacity:24,referenceMaxCapacity:30},render:{coordinateSystem:'source pixels, top-left origin',canonicalViewport:[1586,992],responsive:'uniform scale and centered letterbox for reference comparison; mobile redesign is separate',slotWidth:128,slotHeight:137,gridColumns:6,gridRows:4}};
const kinds=['sword','axe','bow','staff','shield','helmet','armor','boots','ring','amulet','redPotion','bluePotion','staminaPotion','antidote','elixir','herb','mushroom','ore','crystal','leather','key','scroll','coinPouch','gem'];
const quantities=[1,1,1,1,1,1,1,1,1,1,8,5,3,2,1,12,7,9,4,6,1,3,18,2];
// Per-tile ivory glyph bounds, expanded two pixels to include antialiasing.
// Keeping these separate avoids erasing the crystal/gem artwork beside the digits.
const quantityRects=[
 R(105,112,11,18),R(105,112,10,18),R(104,112,10,18),R(103,112,11,18),R(104,111,11,19),R(110,111,10,19),
 R(105,111,11,18),R(105,111,10,18),R(104,111,10,18),R(103,111,11,18),R(103,111,13,19),R(109,111,12,18),
 R(104,111,13,19),R(103,111,13,19),R(104,111,10,19),R(94,111,22,19),R(103,111,13,19),R(108,111,14,19),
 R(103,111,14,19),R(103,111,14,19),R(104,111,10,19),R(102,111,13,19),R(94,111,22,19),R(109,111,12,19)
];
const xs=[149,289,430,570,711,851],ys=[222,376,529,682];
const definitions=[];
function add(key,rect,role,extra={}){definitions.push({key,rect,role,...extra});manifest.assets[key]={file:`skin/${key}.png`,sourceRect:rect,role,...extra};}
add('environmentLeft',R(0,0,127,992),'environment edge, no interactive content');
add('environmentRight',R(1453,0,133,992),'environment edge, decorative banner lettering only');
add('environmentTop',R(0,0,1586,17),'environment edge');
add('environmentBottom',R(0,976,1586,16),'environment edge');
add('headerFill',R(560,20,530,105),'quiet environment/header texture');
// These strips retain the reference header geometry; do not stretch headerFill
// over the header. The excluded coin-value area stays native and variable.
add('headerLeftMiddle',R(127,0,986,137),'exact header branding, quiet environment and underline',{drawAtSourceRect:true,rasterTextAllowed:true,notEditableBodyText:true});
add('headerRightLower',R(1113,62,340,75),'exact decorative motto and lower underline',{drawAtSourceRect:true,rasterTextAllowed:true,notEditableBodyText:true});
add('headerRightUpper',R(1296,0,157,62),'exact static divider and close chrome',{drawAtSourceRect:true});
add('headerCoinBlank',R(1280,17,16,45),'blank texture for the variable coin-value area',{intendedFillRect:R(1113,17,183,45),allowHorizontalStretch:true,containsBakedCoinValue:false});
add('panelFill',R(420,214,8,620),'blank vertical gap between item cells; no labels or selected glow');
add('headerBranding',layout.controls.headerBranding,'decorative branding',{rasterTextAllowed:true,notEditableBodyText:true});
add('logo',R(132,27,119,99),'decorative compass logo');
add('coin',layout.controls.coin,'coin ornament');add('close',layout.controls.close,'close glyph');
add('compass',layout.controls.primaryIcon,'button ornament');add('sellCoins',layout.controls.sellIcon,'button ornament');
add('searchIcon',layout.controls.searchIcon,'search ornament');add('capacityIcon',layout.controls.capacityIcon,'footer bag ornament');
add('menu',layout.controls.menu,'menu glyph');add('sortArrow',R(1325,902,22,17),'dropdown glyph');
add('detailSword',layout.controls.detailIcon,'reference detail artwork and underlying nonsemantic panel texture',{opaqueReferencePanelTexture:true});
add('statAttack',R(1233,337,34,33),'stat ornament');add('statCrit',R(1233,396,34,33),'stat ornament');add('statDurability',R(1233,455,34,33),'stat ornament');
add('detailDivider',layout.controls.detailDivider,'decorative horizontal divider; sword excluded');
add('detailLowerDivider',R(1047,533,371,13),'decorative horizontal divider');
add('frameLeft',layout.panels.left,'frame-only',{mode:'frame',insets:[12,12,12,12]});
add('frameRight',layout.panels.right,'frame-only',{mode:'frame',insets:[12,12,12,12]});
const detailMaskSources=[
 ...['detailIcon','detailTitle','rarity','description','primary','sell'].map(control=>({control,sourceRect:layout.controls[control],padding:control==='detailIcon'?0:2})),
 ...layout.detail.stats.flatMap((stat,index)=>['labelRect','valueRect'].map(field=>({control:`detail.stats[${index}].${field}`,sourceRect:stat[field],padding:2})))
];
add('detailBackground',layout.panels.right,'reference detail-panel background with all dynamic content removed',{mode:'masked',drawAtSourceRect:true,maskSources:detailMaskSources});
add('frameFooter',layout.panels.footer,'frame-only',{mode:'frame',insets:[9,9,9,9]});
add('slotNormalFrame',R(289,222,128,137),'normal rare frame only',{mode:'frame',insets:[8,8,8,8]});
add('slotSelectedFrame',R(144,217,138,147),'reference selected gold frame/glow only',{mode:'frame',insets:[9,9,9,9],placementOffset:{x:-5,y:-5}});
add('progressFrame',layout.controls.progress,'progress outline only',{mode:'frame',insets:[4,4,4,4]});
add('progressFill',R(310,901,12,10),'clean gold progress texture');
add('primaryBg',layout.controls.primary,'stretchable button without action lettering',{mode:'skin',insets:[10,14,10,14],centerTextureSourceRect:R(1065,702,70,29)});
add('secondaryBg',layout.controls.sell,'stretchable button without action lettering',{mode:'skin',insets:[10,14,10,14],centerTextureSourceRect:R(1066,780,65,29)});
add('searchBg',layout.controls.search,'stretchable input without prompt or magnifier',{mode:'skin',insets:[6,6,6,6],centerTextureSourceRect:R(402,165,30,23)});
add('tabNormalBg',R(571,156,101,45),'stretchable tab without category lettering',{mode:'skin',insets:[5,5,5,5],centerTextureSourceRect:R(580,165,12,24)});
add('tabSelectedBg',layout.controls.tab_all,'stretchable selected tab without category lettering',{mode:'skin',insets:[5,5,5,5],centerTextureSourceRect:R(474,165,13,24)});
add('sortBg',layout.controls.sort,'stretchable dropdown without sort lettering or arrow',{mode:'skin',insets:[5,5,5,5],centerTextureSourceRect:R(1148,891,8,29)});
for(let i=0;i<24;i++){
 const rect=R(xs[i%6],ys[Math.floor(i/6)],128,137),quantityRect=quantityRects[i],key=`slot${String(i).padStart(2,'0')}`;
 const info={index:i,kind:kinds[i],asset:key,rect,quantityRect,referenceQuantity:quantities[i]};layout.slots.push(info);
 add(key,rect,'reference item tile with original baked quantity',{kind:kinds[i],index:i,bakedQuantity:true,quantityRect,referenceQuantity:quantities[i],bakedSelection:i===0,mode:i===0?'normalSword':'crop'});
}
add('leftBackground',layout.panels.left,'reference left-panel texture with all dynamic controls and item slots removed',{
 mode:'masked',drawAtSourceRect:true,maskSources:[
  ...['search','tab_all','tab_equipment','tab_consumable','tab_material','tab_quest'].map(control=>({control,sourceRect:layout.controls[control],padding:2})),
  ...layout.slots.map(slot=>({control:`slots[${slot.index}]`,sourceRect:slot.rect,padding:2})),
  {control:'slotSelectedFrame',sourceRect:manifest.assets.slotSelectedFrame.sourceRect,padding:8}
 ]
});
add('footerBackground',layout.panels.footer,'reference footer texture with variable text, progress and sort control removed',{
 mode:'masked',drawAtSourceRect:true,maskSources:[
  {control:'summary',sourceRect:layout.controls.summary,padding:2},
  ...['progress','sort'].map(control=>({control,sourceRect:layout.controls[control],padding:0}))
 ]
});
await fs.mkdir(path.join(here,'skin'),{recursive:true});
await fs.writeFile(path.join(here,'layout-reference.json'),JSON.stringify(layout,null,2)+'\n');
await fs.writeFile(path.join(here,'skin-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
async function rgba(rect){return sharp(reference).extract(sharpRect(rect)).ensureAlpha().raw().toBuffer();}
for(const def of definitions){
 const {key,rect}=def;let pixels=await rgba(rect);const info=manifest.assets[key];
 info.sourcePixelsSha256=sha(pixels);
 if(def.mode==='frame'){
  const [top,right,bottom,left]=def.insets;
  for(let y=top;y<rect.height-bottom;y++)for(let x=left;x<rect.width-right;x++)pixels.fill(0,(y*rect.width+x)*4,(y*rect.width+x)*4+4);
  info.transparentCenter=R(left,top,rect.width-left-right,rect.height-top-bottom);
  info.borderImage={slice:def.insets,fill:false};info.semanticCenterRemoved=true;
 }
 if(def.mode==='skin'){
  const [top,right,bottom,left]=def.insets,w=rect.width-left-right,h=rect.height-top-bottom;
  const texture=await rgba(def.centerTextureSourceRect);info.centerTextureSourcePixelsSha256=sha(texture);
  const center=await sharp(texture,{raw:{width:def.centerTextureSourceRect.width,height:def.centerTextureSourceRect.height,channels:4}}).resize(w,h,{fit:'fill'}).raw().toBuffer();
  for(let y=0;y<h;y++)center.copy(pixels,((top+y)*rect.width+left)*4,y*w*4,(y+1)*w*4);
  info.replacedCenter=R(left,top,w,h);info.semanticCenterRemoved=true;info.borderImage={slice:def.insets,fill:true};
 }
 if(def.mode==='normalSword'){
  const normal=await rgba(R(289,222,128,137)),inset=8;
  for(let y=0;y<rect.height;y++)for(let x=0;x<rect.width;x++)if(x<inset||x>=rect.width-inset||y<inset||y>=rect.height-inset){const o=(y*rect.width+x)*4;normal.copy(pixels,o,o,o+4);}
  info.selectionPerimeterReplacedFrom=R(289,222,128,137);info.selectionPerimeterSourcePixelsSha256=sha(normal);info.selectionPerimeterInset=inset;info.bakedSelectionRemoved=true;
 }
 if(def.mode==='masked'){
  info.transparentMasks=def.maskSources.map(mask=>{
   const r=mask.sourceRect,p=mask.padding;
   const x=Math.max(0,r.x-p-rect.x),y=Math.max(0,r.y-p-rect.y);
   const right=Math.min(rect.width,r.x+r.width+p-rect.x),bottom=Math.min(rect.height,r.y+r.height+p-rect.y);
   const localRect=R(x,y,right-x,bottom-y);
   for(let row=y;row<bottom;row++)pixels.fill(0,(row*rect.width+x)*4,(row*rect.width+right)*4);
   return {...mask,localRect,expandedSourceRect:R(rect.x+x,rect.y+y,right-x,bottom-y)};
  });
  info.dynamicContentRemoved=true;info.maskFill='zero RGBA; draw a nonsemantic base texture below the holes';
  const original=await rgba(rect);let unmaskedPixelCount=0;
  for(let y=0;y<rect.height;y++)for(let x=0;x<rect.width;x++){
   const masked=info.transparentMasks.some(({localRect:m})=>x>=m.x&&x<m.x+m.width&&y>=m.y&&y<m.y+m.height),o=(y*rect.width+x)*4;
   if(masked)assert.equal(pixels.readUInt32LE(o),0);else{assert.equal(pixels.readUInt32LE(o),original.readUInt32LE(o));unmaskedPixelCount++;}
  }
  info.unmaskedPixelCount=unmaskedPixelCount;info.unmaskedPixelsMatchReference=true;
 }
 const bytes=await sharp(pixels,{raw:{width:rect.width,height:rect.height,channels:4}}).png().toBuffer();
 const outputPath=path.join(here,info.file),existing=await fs.readFile(outputPath).catch(error=>{if(error.code==='ENOENT')return null;throw error;});
 if(!existing||!existing.equals(bytes))await fs.writeFile(outputPath,bytes);
 info.sha256=sha(bytes);info.bytes=bytes.length;info.width=rect.width;info.height=rect.height;
 if(!['frame','skin','normalSword','masked'].includes(def.mode))assert.deepEqual(await sharp(bytes).raw().toBuffer(),await rgba(rect));
 if(def.mode==='frame'){const c=info.transparentCenter;for(let y=c.y;y<c.y+c.height;y++)for(let x=c.x;x<c.x+c.width;x++)assert.equal(pixels.readUInt32LE((y*rect.width+x)*4),0);}
}
const ornamentSources=[
 {key:'compassAlpha',sourceAsset:'compass',prompt:'Use case: background-extraction. Edit target: the attached tiny raster compass ornament cropped from our game UI reference. Remove ONLY its entire textured orange/gold rectangular background. Preserve the exact dark near-black compass rose / four-point navigational star outline, its internal ring, asymmetrical spear points, line widths, orientation, proportions, and all original icon geometry. Output that same single dark compass ornament isolated on a genuinely transparent alpha background, tightly framed with a small transparent margin. It is a small button icon and will be shown at 36px. Do not redesign, add points, add a button, add text, add shadows, add a gold rectangle, recolor the icon, or draw a checkerboard.'},
 {key:'sellCoinsAlpha',sourceAsset:'sellCoins',prompt:'Use case: background-extraction. Edit target: the attached tiny raster silver coin-stack ornament cropped from our game UI reference. Remove ONLY the entire dark rectangular background. Preserve exactly the same three overlapping stacks of flat silver coins, their count, silhouettes, placement, perspective, gray colors and highlight strokes. Output the same single silver coin-stack ornament on a genuinely transparent alpha background, tightly framed with a small transparent margin. It is a button icon and will be shown at 36px. Do not redesign, add coins, add a button, add text, add a backing square, add shadow or draw checkerboard.'},
 {key:'coinAlpha',sourceAsset:'coin',prompt:'Use case: background-extraction. Edit target: attached gold coin UI ornament. Remove only the dark square background. Preserve the same slightly tilted single antique gold coin, its circular rim, shaded bevel, engraved four-point compass/star emblem, warm gold colors, original silhouette and proportions. Output the isolated same coin on a genuinely transparent alpha background, tightly framed with a small transparent margin. This will be a 28px header currency icon. Do not add numbers, letters, more coins, a button, a backing square, glow, cast shadow, or checkerboard. Keep the original icon geometry and orientation.'}
];
for(const ornament of ornamentSources){
 const generatedFile=`skin/provenance/${ornament.key}.generated.png`,generated=await fs.readFile(path.join(here,generatedFile)).catch(e=>{if(e.code==='ENOENT')return null;throw e;});if(!generated)continue;
 const {data,info}=await sharp(generated).ensureAlpha().raw().toBuffer({resolveWithObject:true});const threshold=8,pad=2;let left=info.width,top=info.height,right=-1,bottom=-1;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>=threshold){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 assert(right>=left,'Generated ornament has no visible pixels');left=Math.max(0,left-pad);top=Math.max(0,top-pad);right=Math.min(info.width-1,right+pad);bottom=Math.min(info.height-1,bottom+pad);
 const trimRect={left,top,width:right-left+1,height:bottom-top+1},bytes=await sharp(generated).extract(trimRect).png().toBuffer(),file=`skin/${ornament.key}.png`,outputPath=path.join(here,file),old=await fs.readFile(outputPath).catch(e=>{if(e.code==='ENOENT')return null;throw e;});if(!old||!old.equals(bytes))await fs.writeFile(outputPath,bytes);
 const decoded=await sharp(bytes).raw().toBuffer();let transparentPixels=0;for(let p=3;p<decoded.length;p+=4)if(decoded[p]===0)transparentPixels++;
 assert(transparentPixels>0,'Ornament must retain actual transparent pixels');
 manifest.assets[ornament.key]={file,width:trimRect.width,height:trimRect.height,sha256:sha(bytes),bytes:bytes.length,role:'Independent transparent adaptive UI ornament',sourceAsset:ornament.sourceAsset,sourceRect:manifest.assets[ornament.sourceAsset].sourceRect,referenceCropSha256:manifest.assets[ornament.sourceAsset].sha256,transparentPixels,generation:{tool:'built-in image_gen',useCase:'background-extraction',transparentBackground:true,prompt:ornament.prompt,file:generatedFile,sha256:sha(generated),width:info.width,height:info.height},trimRect,alphaThreshold:threshold,padding:pad,note:'Image-generation background extraction, not a pixel-identical reference layer; canonical reference crops remain unchanged. Subsequent processing is a rectangular crop only.'};
}
manifest.status='prepared';manifest.generatedAt=new Date().toISOString();manifest.assetCount=Object.keys(manifest.assets).length;
manifest.scope='Reference crops and masked UI skins retain exact unmasked source pixels. Additional adaptive alpha ornaments use separately recorded image-generation background extraction; they are not pixel-identical original layers. Visual fidelity and runtime integration remain to be verified.';
await fs.writeFile(path.join(here,'skin-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({status:manifest.status,assets:manifest.assetCount,layout:path.join(here,'layout-reference.json'),manifest:path.join(here,'skin-manifest.json'),reference:manifest.reference},null,2));
