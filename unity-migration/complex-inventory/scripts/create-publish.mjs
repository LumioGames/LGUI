import assert from 'node:assert/strict';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const validation = path.resolve(root, '../..');
const projectRoot = path.join(root, 'project');
const projectPath = path.join(projectRoot, 'Inventory.fairy');
const baselineRoot = path.join(validation, '闭环验证/roundtrip-final/project');
const output = path.join(root, 'published');
const require = createRequire(path.join(validation, 'toolchain-test/package.json'));
const sharp = require('sharp');
const core = require('@openfairygui/core');
const { NodeIO } = require('@openfairygui/core/node');
const { publishNode, validateProjectNode } = require('@openfairygui/functions/node');
const { createNodeBackendRuntime } = require('@openfairygui/backend/node');
const { ITEM_CATALOG } = await import(pathToFileURL(path.join(root, 'shared/catalog.ts')));
const { AutoSizeType, GraphType, AlignType, LoaderFillType, ListLayoutType, OverflowType, ScrollBarDisplayType, TransitionActionType, composeTransition, liftDocumentToUamProject } = core;
const layout = JSON.parse(await fs.readFile(path.join(output, 'layout.json'), 'utf8'));
const ids = { package:'invtest1', ComplexMain:'cxmain01', ItemSlot:'cxslot01', Detail:'cxdetl01', ComplexBtn:'cxbtn001', backdrop:'cxback01' };
const oldIds = { Btn:'button01', ItemRow:'itemrow1', Main:'main0001', Reward:'reward01', icon:'icon0001' };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const report = { schemaVersion:1, status:'running', sourceProject:projectPath, baseline:baselineRoot, sdk:'0.7.0', checks:[], ids, oldIds, files:[] };
const check = (name, evidence) => report.checks.push({name, passed:true, ...(evidence === undefined ? {} : {evidence})});
const writeJson = (name, value) => fs.writeFile(path.join(output,name), JSON.stringify(value,null,2)+'\n');

async function manifest(directory, relative='') {
  const result=[];
  for(const entry of await fs.readdir(path.join(directory,relative), {withFileTypes:true})) {
    assert(!entry.isSymbolicLink(), 'No symlinks in fixture paths');
    const name=path.join(relative,entry.name);
    if(entry.isDirectory()) result.push(...await manifest(directory,name));
    else { const bytes=await fs.readFile(path.join(directory,name)); result.push({path:name.replaceAll('\\','/'),size:bytes.length,sha256:hash(bytes)}); }
  }
  return result.sort((a,b)=>a.path.localeCompare(b.path));
}

function projection(project) {
  const pkg=project.packages.find(p=>p.id===ids.package);
  return Object.fromEntries(pkg.resources.filter(r=>r.kind==='component').map(r=>[r.id,{name:r.name,size:r.component.size,children:r.component.displayList.map(n=>({id:n.id,name:n.name,kind:n.kind,position:n.position,size:n.size,resource:n.resource,url:n.url,defaultItem:n.defaultItem,layout:n.layout,columnCount:n.columnCount}))}]));
}

let baselineBefore;
await fs.mkdir(output,{recursive:true});
try {
  for(const name of ['core','functions','backend']) assert.equal(JSON.parse(await fs.readFile(path.join(validation,'toolchain-test/node_modules/@openfairygui',name,'package.json'),'utf8')).version,'0.7.0');
  assert.equal(ITEM_CATALOG.length,24);
  assert.deepEqual(ITEM_CATALOG.map(x=>x.iconIndex),Array.from({length:24},(_,i)=>i));
  baselineBefore=await manifest(baselineRoot);
  assert.equal(baselineBefore.length,10);
  await writeJson('source-baseline-manifest.json',baselineBefore);
  const artRoot=path.join(root,'art');
  const atlasPath=path.join(artRoot,'items-atlas.png');
  const atlasBytes=await fs.readFile(atlasPath);
  const atlasMetadata=await sharp(atlasBytes).metadata();
  assert.equal(atlasMetadata.width,1536);assert.equal(atlasMetadata.height,1024);assert.equal(atlasMetadata.channels,4);assert.equal(atlasMetadata.hasAlpha,true);
  const backdropBytes=await fs.readFile(path.join(artRoot,'backdrop.png'));
  const backdropMetadata=await sharp(backdropBytes).metadata();
  report.art={atlas:{path:atlasPath,width:1536,height:1024,sha256:hash(atlasBytes)},backdrop:{width:backdropMetadata.width,height:backdropMetadata.height,sha256:hash(backdropBytes)},referenceSha256:hash(await fs.readFile(path.join(artRoot,'reference.png')))};
  check('art dimensions and alpha contract');

  // Work on an isolated copy, never write the saved browser source.
  await fs.mkdir(projectRoot,{recursive:true});
  for(const file of baselineBefore) {
    const destination=path.join(projectRoot,file.path);
    await fs.mkdir(path.dirname(destination),{recursive:true});
    await fs.copyFile(path.join(baselineRoot,file.path),destination);
  }
  const document=await new NodeIO().readProject(path.join(baselineRoot,'Inventory.fairy'));
  const pkg=document.getRoot().getPackageById(ids.package);
  assert(pkg && pkg.getName()==='Inventory');
  const originalEntries=pkg.listResources().map(r=>({id:r.getId(),name:r.getName(),path:r.getPath(),exported:r.getExported()}));
  const artManifest={schemaVersion:1,sourceAtlas:report.art.atlas,columns:6,rows:4,cell:256,images:[]};
  const images=[];
  for(const [index,item] of ITEM_CATALOG.entries()) {
    const rect={left:(index%6)*256,top:Math.floor(index/6)*256,width:256,height:256};
    const bytes=await sharp(atlasBytes).extract(rect).png().toBuffer();
    const rawBefore=await sharp(atlasBytes).extract(rect).raw().toBuffer();
    const rawAfter=await sharp(bytes).raw().toBuffer();
    assert.deepEqual(rawAfter,rawBefore,'Cropping must preserve every RGBA sample');
    const resourceId=`icx${String(index).padStart(5,'0')}`;
    const entry={index,kind:item.kind,name:item.name,resourceId,url:`ui://${ids.package}${resourceId}`,file:`${resourceId}.png`,rect,width:256,height:256,sha256:hash(bytes),rgbaSha256:hash(rawBefore)};
    artManifest.images.push(entry);images.push({...entry,bytes});
  }
  images.push({resourceId:ids.backdrop,file:'cxback01.png',width:backdropMetadata.width,height:backdropMetadata.height,bytes:backdropBytes});
  for(const image of images) {
    const resource=document.createImageResource(image.resourceId).setId(image.resourceId).setPath('/').setFileName(image.file).setWidth(image.width).setHeight(image.height).setExported(true);
    resource.setSourceData(document.createBuffer().setURI(image.file).setMimeType('image/png').setData(new Uint8Array(image.bytes)));
    pkg.addResource(resource);
  }
  await writeJson('art-manifest.json',artManifest);
  check('24 row-major exact RGBA crops',artManifest.images.map(x=>({index:x.index,kind:x.kind,id:x.resourceId})));

  const component=(name,width,height)=>{const c=document.createComponent(name).setId(ids[name]).setPath('/').setExported(true).setSize(width,height).setOpaque(true);pkg.addResource(c);return c;};
  const position=(node,rect)=>node.setXY(rect[0],rect[1]).setSize(rect[2],rect[3]);
  const graph=(parent,name,rect,color,lineColor='#9a7c50',line=0,alpha=1)=>{
    const node=position(document.createGGraph(name).setId(name),rect).setGraphType(GraphType.Rect).setFillColor(color).setLineSize(line).setLineColor(lineColor).setAlpha(alpha).setTouchable(false);parent.addChild(node);return node;
  };
  const text=(parent,name,value,rect,size=18,color='#e9ddc4')=>{
    const node=position(document.createGTextField(name).setId(name),rect).setText(value).setFont('Arial').setFontSize(size).setColor(color).setAutoSize(AutoSizeType.None).setTouchable(false);parent.addChild(node);return node;
  };
  const loader=(parent,name,rect,url)=>{
    const node=position(document.createGLoader(name).setId(name),rect).setUrl(url).setFill(LoaderFillType.Scale).setAlign(1).setVAlign(1).setAutoSize(false).setTouchable(false);parent.addChild(node);return node;
  };
  const button=(parent,name,title,rect)=>{
    const node=position(document.createGComponent(name).setId(name),rect).setSrc(ids.ComplexBtn).setInstanceExtType('Button').setInstanceTitle(title);parent.addChild(node);return node;
  };
  const buttonResource=component('ComplexBtn',132,40).setExtensionType('Button');
  graph(buttonResource,'btnbg',[0,0,132,40],'#392f24','#b1915c',1,0.97).setCornerRadius([3,3,3,3]).setRelations([{target:'',type:14,usePercent:false},{target:'',type:15,usePercent:false}]);
  text(buttonResource,'title','操作',[0,6,132,28],18).setAlign(AlignType.Center).setRelations([{target:'',type:14,usePercent:false},{target:'',type:10,usePercent:false}]);

  const slot=component('ItemSlot',112,114);
  graph(slot,'border',layout.slot.border,'#102334','#54758c',1);
  graph(slot,'tile',layout.slot.tile,'#081521','#54758c',0,0.9);
  loader(slot,'icon',layout.slot.icon,artManifest.images[0].url);
  text(slot,'quantity','1',layout.slot.quantity,19,'#f5eddb').setAlign(AlignType.Right);
  text(slot,'label','苍纹长剑',layout.slot.label,12,'#d6d5cb').setAlign(AlignType.Center).setSingleLine(true);
  graph(slot,'selected',layout.slot.selected,'#00000000','#f2bd61',3).setVisible(false);

  const detailDefaults={detailTitle:['苍纹长剑',25,'#f0dfb9'],rarity:['稀有 · 武器',17,'#83c7e5'],stats:['攻击 +18\n装备槽：weapon',18,'#ded8c7'],description:['锻有苍蓝纹路的旅行长剑。\n同槽旧装备自动放回背包。',16,'#b7bdbd']};
  const detailNodes=(parent,offsetX=0,offsetY=0)=>{
    const bounds=name=>{const a=layout.main[name];return[a[0]-offsetX,a[1]-offsetY,a[2],a[3]];};
    graph(parent,'detailbg',bounds('detailbg'),'#081725','#957848',1,0.94);
    loader(parent,'detailIcon',bounds('detailIcon'),artManifest.images[0].url);
    for(const [name,[value,size,color]] of Object.entries(detailDefaults)) text(parent,name,value,bounds(name),size,color);
    button(parent,'primary','装备',bounds('primary'));
    button(parent,'sell','出售',bounds('sell'));
  };
  // Optional standalone detail resource is not instantiated/nested in ComplexMain.
  detailNodes(component('Detail',360,548),828,128);
  const main=component('ComplexMain',1280,800);
  main.addChild(position(document.createGImage('backdrop').setId('backdrop'),layout.main.backdrop).setSrc(ids.backdrop).setTouchable(false));
  graph(main,'panel',layout.main.panel,'#06111b','#8f734f',1,0.9);
  text(main,'title','旅者背包',layout.main.title,42,'#e8d5af');
  text(main,'subtitle',"TRAVELER'S INVENTORY",layout.main.subtitle,13,'#bb9e6a');
  text(main,'coins','12,480 金币',layout.main.coins,25,'#f0d49c').setAlign(AlignType.Right);
  button(main,'close','×',layout.main.close);
  graph(main,'searchbg',layout.main.searchbg,'#081a28','#607b87',1,0.95);
  main.addChild(position(document.createGTextInput('search').setId('search'),layout.main.search).setText('').setPromptText('搜索物品…').setFont('Arial').setFontSize(17).setColor('#e9ddc4').setAutoSize(AutoSizeType.None).setSingleLine(true));
  for(const [category,label] of [['all','全部'],['equipment','装备'],['consumable','消耗品'],['material','材料'],['quest','任务']]) button(main,`tab_${category}`,label,layout.main[`tab_${category}`]);
  main.addChild(position(document.createGList('list').setId('list'),layout.main.list).setLayout(ListLayoutType.FlowHorizontal).setColumnCount(6).setColumnGap(8).setLineGap(10).setDefaultItem(layout.grid.defaultItem).setOverflow(OverflowType.Scroll).setScrollBarDisplay(ScrollBarDisplayType.Hidden).setAutoResizeItem(false));
  detailNodes(main);
  text(main,'summary','24 / 30 格 · 装备与旅途补给',layout.main.summary,17,'#c8bb9e');
  for(const [name,label] of [['sort','默认排序'],['save','保存'],['load','恢复'],['reward','旅途奖励']]) button(main,name,label,layout.main[name]);
  text(main,'notice','选择道具查看详情；装备、使用与出售由同一份 TypeScript 业务处理。',layout.main.notice,14,'#94a8b6');
  composeTransition(document,main,{name:'enter',fps:24,autoPlay:false,items:[{time:0,actionType:TransitionActionType.Alpha,tween:true,duration:12,startValue:[0],endValue:[1]}]});
  assert.deepEqual(main.listChildren().map(x=>x.getName()).sort(),Object.keys(layout.main).sort());

  // Let the formal writer create complete files in staging, then preserve baseline bytes.
  const staged=path.join(output,'staged-project');
  await fs.mkdir(staged,{recursive:true});
  await new NodeIO().writeProject(document,path.join(staged,'Inventory.fairy'));
  for(const file of await manifest(staged)) {
    if(baselineBefore.some(old=>old.path===file.path) && file.path!=='assets/Inventory/package.xml') continue;
    const destination=path.join(projectRoot,file.path);
    await fs.mkdir(path.dirname(destination),{recursive:true});await fs.copyFile(path.join(staged,file.path),destination);
  }
  const source=liftDocumentToUamProject(await new NodeIO().readProject(projectPath));
  const sourcePackage=source.packages.find(p=>p.id===ids.package);
  for(const [name,id] of Object.entries(oldIds)) assert(sourcePackage.resources.some(r=>r.id===id && r.name===name));
  const reopened=await new NodeIO().readProject(projectPath);
  assert.deepEqual(reopened.getRoot().getPackageById(ids.package).listResources().filter(r=>Object.values(oldIds).includes(r.getId())).map(r=>({id:r.getId(),name:r.getName(),path:r.getPath(),exported:r.getExported()})),originalEntries);
  const actualMain=sourcePackage.resources.find(r=>r.id===ids.ComplexMain).component;
  assert.deepEqual(actualMain.displayList.map(n=>n.name).sort(),Object.keys(layout.main).sort());
  const validationResult=await validateProjectNode(projectPath);
  assert.equal(validationResult.status,'valid');assert.equal(validationResult.complete,true);report.validation=validationResult;
  check('formal save/reopen source references and exact flat child contract');
  const sourceManifest=await manifest(projectRoot);
  const modifiedBaseline=baselineBefore.filter(old=>sourceManifest.find(now=>now.path===old.path)?.sha256!==old.sha256).map(x=>x.path);
  assert.deepEqual(modifiedBaseline,['assets/Inventory/package.xml']);
  await writeJson('source-diff-manifest.json',{baseline:baselineBefore,complex:sourceManifest,modifiedBaseline,oldResourceEntriesPreserved:true,originalDirectoryUnchanged:true});
  await writeJson('source-projection.json',projection(source));
  check('nine baseline files byte identical; descriptor only appends new resources',modifiedBaseline);

  for(const [target,type,extension] of [['layabox',4,'fui'],['unity',0,'bytes']]) {
    const targetDocument=await new NodeIO().readProject(projectPath);targetDocument.getRoot().setProjectType(type);
    const targetOutput=path.join(output,target);
    const result=await publishNode({document:targetDocument,output:targetOutput,assetsPath:path.join(projectRoot,'assets'),compressed:false,fileExtension:extension,codeGeneration:false,plugins:[]});
    const binaryPath=path.join(targetOutput,target==='unity'?'Inventory_fui.bytes':'Inventory.fui');
    const bytes=await fs.readFile(binaryPath);assert.equal(bytes.subarray(0,4).toString(),'FGUI');assert.equal(bytes[8],0);
    const decoded=liftDocumentToUamProject(await new NodeIO().readBinary(binaryPath));
    const decodedPackage=decoded.packages.find(p=>p.id===ids.package);
    assert.deepEqual(decodedPackage.resources.map(r=>r.id).sort(),sourcePackage.resources.map(r=>r.id).sort());
    const decodedMain=decodedPackage.resources.find(r=>r.id===ids.ComplexMain).component;
    assert.deepEqual(decodedMain.displayList.map(n=>n.name).sort(),Object.keys(layout.main).sort());
    const list=decodedMain.displayList.find(n=>n.name==='list');assert.equal(list.layout,2);assert.equal(list.columnCount,6);assert.equal(list.defaultItem,layout.grid.defaultItem);
    await writeJson(`${target}-projection.json`,projection(decoded));
    report[target]={result,files:await manifest(targetOutput),headerVersion:bytes.readInt32BE(4),compressed:false};
    check(`${target} formal binary readback IDs, flat children, grid settings`);
  }
  const dom=path.join(output,'dom');await fs.mkdir(dom,{recursive:true});
  await fs.copyFile(path.join(output,'layabox/Inventory.fui'),path.join(dom,'package.xml'));
  const backend=createNodeBackendRuntime({allowedProjectRoots:[projectRoot]});
  const opened=await backend.openSession({projectPath});assert(opened.ok,JSON.stringify(opened));
  try {
    const state=backend.readSessionState({sessionId:opened.data.sessionId});assert(state.ok,JSON.stringify(state));
    const imageMap={};
    report.domReadMethods=[];
    for(const resource of state.data.project.packages[0].resources.filter(r=>r.kind==='image')) {
      let sourceBytes;
      if(resource.id===ids.backdrop && backdropBytes.length>1048576) {
        // Backend caps one resource response at 1 MiB; NodeIO's Document does not hydrate source
        // buffers here. Query the declared filename via Core, then copy that local source verbatim.
        const declared=reopened.getRoot().getPackageById(ids.package).getResourceById(resource.id);
        const sourceImagePath=path.resolve(projectRoot,'assets/Inventory',declared.getPath().replace(/^\/+/,''),declared.getFileName());
        assert(sourceImagePath.startsWith(path.join(projectRoot,'assets/Inventory')+path.sep));
        sourceBytes=await fs.readFile(sourceImagePath);
        assert.equal(hash(sourceBytes),report.art.backdrop.sha256);
        report.domReadMethods.push({resourceId:resource.id,method:'Local filesystem copy of Core SDK-declared image source',sourceImagePath,bytes:sourceBytes.length,sha256:hash(sourceBytes),reason:'Backend readResourceBytes fixed 1 MiB budget; Core readProject leaves source buffer null. Both failures retained; no SDK/native-runtime changes.'});
      } else {
        const image=backend.readResourceBytes({sessionId:opened.data.sessionId,expectedRevision:state.data.revision,selector:{packageId:ids.package,resourceId:resource.id}});assert(image.ok,JSON.stringify(image));
        sourceBytes=image.data.sourceBytes;
        report.domReadMethods.push({resourceId:resource.id,method:'Backend.readResourceBytes',expectedRevision:state.data.revision,bytes:sourceBytes.length});
      }
      const file=`${resource.id}.png`;await fs.writeFile(path.join(dom,file),sourceBytes);imageMap[resource.id]=file;
    }
    assert.equal(Object.keys(imageMap).length,26);
    await fs.writeFile(path.join(dom,'manifest.json'),JSON.stringify({schemaVersion:1,adapter:'legacy-fairygui-dom-loose-images',source:'complex Inventory same-source uncompressed Laya profile',packages:{[ids.package]:{name:'Inventory',images:imageMap}}},null,2)+'\n');
    report.dom={directory:dom,images:Object.keys(imageMap).length,files:await manifest(dom)};
    // Remove only this generator's previous nested output after restoring the agreed flat contract.
    // No recursive deletion, and no path supplied by the caller is accepted here.
    for(const name of ['package.xml','Inventory.fui','manifest.json',...Object.values(imageMap)]) {
      const old=path.join(dom,'Inventory',name);
      try {await fs.unlink(old);} catch(error) {if(error.code!=='ENOENT') throw error;}
    }
    try {await fs.rmdir(path.join(dom,'Inventory'));} catch(error) {if(!['ENOENT','ENOTEMPTY'].includes(error.code)) throw error;}
    report.dom={directory:dom,images:Object.keys(imageMap).length,files:await manifest(dom)};
  } finally {await backend.closeSession({sessionId:opened.data.sessionId});}
  check('formal Backend icon export plus explicit unchanged large-background filesystem copy');
  assert.deepEqual(await manifest(baselineRoot),baselineBefore);
  report.sourceManifest=sourceManifest;
  report.sourceFairySha256=hash(await fs.readFile(projectPath));
  report.status='passed';
} catch(error) {
  report.status='failed';report.error={name:error.name,message:error.message,stack:error.stack};process.exitCode=1;
} finally {
  if(baselineBefore) { report.originalSourceUnchanged=JSON.stringify(await manifest(baselineRoot))===JSON.stringify(baselineBefore);if(!report.originalSourceUnchanged){report.status='failed';process.exitCode=1;} }
  await writeJson('publish-report.json',report);
  console.log(JSON.stringify({status:report.status,sourceProject:projectPath,originalSourceUnchanged:report.originalSourceUnchanged,dom:report.dom?.directory,unity:report.unity?.files,error:report.error},null,2));
}
