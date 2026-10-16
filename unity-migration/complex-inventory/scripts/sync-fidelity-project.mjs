import assert from 'node:assert/strict';
import path from 'node:path';
import {promises as fs} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const validation=path.resolve(root,'../..'),projectRoot=path.join(root,'project'),published=path.join(root,'published');
const require=createRequire(path.join(validation,'toolchain-test/package.json'));
const core=require('@openfairygui/core'),{NodeIO}=require('@openfairygui/core/node'),{validateProjectNode}=require('@openfairygui/functions/node');
const sharp=require('sharp'),hash=b=>createHash('sha256').update(b).digest('hex');
const {GraphType,AutoSizeType,AlignType,VertAlignType,LoaderFillType,ListLayoutType,OverflowType,ScrollBarDisplayType,TransitionActionType,composeTransition,liftDocumentToUamProject}=core;
const skin=JSON.parse(await fs.readFile(path.join(root,'fidelity/skin-manifest.json'),'utf8'));
const layout=JSON.parse(await fs.readFile(path.join(root,'fidelity/layout-reference.json'),'utf8'));
const details=JSON.parse(await fs.readFile(path.join(root,'fidelity/detail-icons.json'),'utf8'));
const shared=await fs.readFile(path.join(root,'dist/ComplexInventoryApp.txt'));
assert.equal(hash(shared),'eb28802c0f99b659c5f53988667c8a43a2a809178e9b1b485bc846fdd672081e');
assert.equal(skin.assetCount,69);assert.equal(details.entries.length,24);
const packageId='invtest1',ids={ComplexMain:'cxmain01',ItemSlot:'cxslot01',Detail:'cxdetl01',ComplexBtn:'cxbtn001'};
const url=id=>`ui://${packageId}${id}`,R=(x,y,width,height)=>({x,y,width,height});
const source=path.join(projectRoot,'Inventory.fairy'),doc=await new NodeIO().readProject(source),pkg=doc.getRoot().getPackageById(packageId);
assert(pkg&&pkg.getName()==='Inventory');
const originalEntries=pkg.listResources().map(r=>({id:r.getId(),name:r.getName(),path:r.getPath(),exported:r.getExported()}));
const protectedNames=['Inventory.fairy','settings/Adaptation.json','settings/Common.json','settings/Publish.json',...['Btn.xml','Main.xml','ItemRow.xml','Reward.xml','icon.png'].map(n=>'assets/Inventory/'+n)];
const protectedBefore=Object.fromEntries(await Promise.all(protectedNames.map(async f=>[f,hash(await fs.readFile(path.join(projectRoot,f)))])));
const report={schemaVersion:1,status:'running',sdk:'0.7.0',source,packageId,protectedBefore,checks:[],sharedBundleSha256:hash(shared)};
const map={schemaVersion:1,package:{id:packageId,name:'Inventory'},design:layout.design,components:Object.fromEntries(Object.entries(ids).map(([name,id])=>[name,{id,url:url(id)}])),skins:{},details:[],tiles:[],originalIcons:Array.from({length:24},(_,i)=>({index:i,id:`icx${String(i).padStart(5,'0')}`,url:url(`icx${String(i).padStart(5,'0')}`)})),referenceSha256:skin.reference.sha256,sharedBundleSha256:hash(shared),buttonResources:{}};
await fs.mkdir(published,{recursive:true});
const writeJson=(file,value)=>fs.writeFile(path.join(published,file),JSON.stringify(value,null,2)+'\n');

async function imageResource(id,name,file,asset){
 const bytes=await fs.readFile(file),meta=await sharp(bytes).metadata();assert.equal(meta.width,asset.width);assert.equal(meta.height,asset.height);
 assert.equal(hash(bytes),asset.sha256);
 let res=pkg.getResourceById(id);if(!res){res=doc.createImageResource(name).setId(id);pkg.addResource(res);}assert.equal(res.propertyType,'ImageResource');
 const filename=id+'.png';res.setName(name).setPath('/').setFileName(filename).setExported(true).setWidth(meta.width).setHeight(meta.height).setSmoothing(true).setScaleOption(0).setScale9Grid(null);
 let grid=null;if(asset.insets){const[t,r,b,l]=asset.insets;grid=[l,t,meta.width-l-r,meta.height-t-b];assert(grid[2]>0&&grid[3]>0);res.setScaleOption(1).setScale9Grid(grid);}
 res.setSourceData(doc.createBuffer().setURI(filename).setMimeType('image/png').setData(new Uint8Array(bytes)));
 return{id,name,url:url(id),file:filename,width:meta.width,height:meta.height,sha256:hash(bytes),sourceFile:path.relative(root,file).replaceAll('\\','/'),scale9Grid:grid,insets:asset.insets??null,quantityRect:asset.quantityRect??null,sourceRect:asset.sourceRect??null};
}
for(const[index,[key,asset]]of Object.entries(skin.assets).entries())map.skins[key]=await imageResource('fs'+String(index).padStart(6,'0'),'Fidelity_'+key,path.join(root,'fidelity',asset.file),asset);
for(const entry of details.entries)map.details.push({...await imageResource('fd'+String(entry.index).padStart(6,'0'),'Fidelity_Detail_'+String(entry.index).padStart(2,'0'),path.join(root,'fidelity',entry.file),entry),index:entry.index});
for(const slot of layout.slots)map.tiles.push({index:slot.index,kind:slot.kind,...map.skins[slot.asset],quantityRect:slot.quantityRect,referenceQuantity:slot.referenceQuantity});
await writeJson('fidelity-resource-map.json',map);

const place=(node,r)=>node.setXY(r.x,r.y).setSize(r.width,r.height);
function component(name,id,width,height,extension=''){
 let c=pkg.getResourceById(id);if(!c){c=doc.createComponent(name).setId(id);pkg.addResource(c);}assert.equal(c.propertyType,'Component');
 for(const child of c.listChildren())c.removeChild(child);for(const ctrl of c.listControllers())c.removeController(ctrl);for(const t of c.listTransitions())c.removeTransition(t);
 return c.setName(name).setSize(width,height).setPath('/').setExported(true).setOpaque(true).setExtensionType(extension);
}
function graph(parent,name,r,color='#041019',line=0,lineColor='#94794f',visible=true){const n=place(doc.createGGraph(name).setId(name),r).setGraphType(GraphType.Rect).setFillColor(color).setLineSize(line).setLineColor(lineColor).setTouchable(false).setVisible(visible);parent.addChild(n);return n;}
function text(parent,name,value,r,size=23,color='#eee2cb',options={}){const n=place(doc.createGTextField(name).setId(name),r).setText(value).setFont(options.font??'SimSun').setFontSize(size).setColor(color).setAutoSize(AutoSizeType.None).setAlign(options.align??AlignType.Left).setVAlign(options.valign??1).setSingleLine(options.singleLine??true).setBold(options.bold??false).setLeading(options.leading??0).setTouchable(false).setVisible(options.visible??true);parent.addChild(n);return n;}
function loader(parent,name,r,key,options={}){const n=place(doc.createGLoader(name).setId(name),r).setUrl(key?(map.skins[key]?.url??key):'').setFill(options.fill??LoaderFillType.ScaleFree).setAlign(1).setVAlign(1).setTouchable(false).setVisible(options.visible??true);parent.addChild(n);return n;}
function image(parent,name,key,r){const a=map.skins[key];assert(a,key);const n=place(doc.createGImage(name).setId(name),r??a.sourceRect).setSrc(a.id).setTouchable(false);parent.addChild(n);return n;}
function buttonResource(name,id,width,height,bg,iconKey,iconRect,titleRect,titleSize=28,titleColor='#eee2cb'){
 const c=component(name,id,width,height,'Button');
 loader(c,'btnbg',R(0,0,width,height),bg).setRelations([{target:'',type:14,usePercent:false},{target:'',type:15,usePercent:false}]);
 loader(c,'icon',iconRect??R(0,0,0,0),iconKey??'');
 text(c,'title','操作',titleRect??R(0,0,width,height),titleSize,titleColor,{align:AlignType.Center}).setRelations([{target:'',type:14,usePercent:false},{target:'',type:15,usePercent:false}]);
 map.buttonResources[name]={id,url:url(id),width,height,background:bg,icon:iconKey??null,children:{btnbg:'GLoader',icon:'GLoader',title:'GTextField'}};
 return c;
}
buttonResource('ComplexBtn',ids.ComplexBtn,370,65,'primaryBg','compass',R(115,16,44,39),R(182,14,85,39),28,'#251b0c');
buttonResource('FidelitySecondaryBtn','fb000001',370,65,'secondaryBg','sellCoins',R(116,16,43,33),R(183,13,85,39),29);
buttonResource('FidelityTabBtn','fb000002',101,45,'tabNormalBg',null,null,R(0,0,101,45),23);
buttonResource('FidelityCloseBtn','fb000003',39,39,'close',null,null,R(0,0,39,39),20);
buttonResource('FidelitySortBtn','fb000004',216,49,'sortBg',null,null,R(8,0,134,49),27);
buttonResource('FidelityMenuBtn','fb000005',34,38,'menu',null,null,R(0,0,34,38),20);
function button(parent,name,title,r,style='ComplexBtn',bg=null){const id=map.buttonResources[style].id;const n=place(doc.createGComponent(name).setId(name),r).setSrc(id).setInstanceExtType('Button').setInstanceTitle(title);if(bg)n.setPropertyOverrides([{target:'btnbg',propertyId:1,value:map.skins[bg].url}]);parent.addChild(n);return n;}

const slot=component('ItemSlot',ids.ItemSlot,128,137);
graph(slot,'border',R(0,0,128,137),'#00000000',0,'#54758c',false);graph(slot,'tile',R(0,0,128,137),'#00000000',0,'#54758c',false);
loader(slot,'icon',R(0,0,128,137),'slot00');
const qr=layout.slots[0].quantityRect;graph(slot,'quantityMask',qr,'#050e14');
text(slot,'quantity','1',R(qr.x-20,qr.y-5,qr.width+18,28),24,'#f0eee0',{font:'Times New Roman',align:AlignType.Right});
text(slot,'label','霜纹长剑',R(0,115,128,20),12,'#d6d5cb',{visible:false});
graph(slot,'selected',R(0,0,128,137),'#00000000',0,'#f2bd61',false);
loader(slot,'selectedFrame',R(-5,-5,138,147),'slotSelectedFrame',{visible:false});

const main=component('ComplexMain',ids.ComplexMain,1586,992);
image(main,'backdrop','environmentTop',R(0,0,1586,17)).setVisible(false);
graph(main,'panel',layout.panels.left);graph(main,'detailbg',layout.panels.right);graph(main,'footerbg',layout.panels.footer);
for(const key of ['environmentLeft','environmentRight','environmentTop','environmentBottom','headerLeftMiddle','headerRightLower','headerRightUpper'])image(main,'art_'+key,key);
image(main,'art_headerCoinBlank','headerCoinBlank',skin.assets.headerCoinBlank.intendedFillRect);
for(const key of ['leftBackground','detailBackground','footerBackground','frameLeft','frameRight','frameFooter','headerBranding','coin'])image(main,'art_'+key,key);
text(main,'title','旅者背包',layout.controls.headerBranding,52,'#eed7ad',{visible:false});text(main,'subtitle',"TRAVELER'S INVENTORY",R(264,100,290,25),18,'#bb9e6a',{visible:false});
text(main,'coins','12,480',layout.controls.coins,32,'#f5e5c9',{font:'Times New Roman'});button(main,'close','',layout.controls.close,'FidelityCloseBtn');
graph(main,'searchbg',layout.controls.search,'#00000000',0,'#94794f',false);image(main,'art_searchBg','searchBg',layout.controls.search);image(main,'art_searchIcon','searchIcon');
const input=place(doc.createGTextInput('search').setId('search'),layout.controls.searchText).setText('').setPromptText('搜索物品……').setFont('SimSun').setFontSize(23).setColor('#d7d5c8').setAutoSize(AutoSizeType.None).setSingleLine(true);main.addChild(input);
for(const[category,title]of Object.entries({all:'全部',equipment:'装备',consumable:'消耗品',material:'材料',quest:'任务'}))button(main,'tab_'+category,title,layout.controls['tab_'+category],'FidelityTabBtn',category==='all'?'tabSelectedBg':null);
main.addChild(place(doc.createGList('list').setId('list'),layout.controls.list).setLayout(ListLayoutType.FlowHorizontal).setColumnCount(6).setColumnGap(12).setLineGap(17).setDefaultItem(url(ids.ItemSlot)).setOverflow(OverflowType.Scroll).setScrollBarDisplay(ScrollBarDisplayType.Hidden).setAutoResizeItem(false));
function detailNodes(parent,ox=0,oy=0){const bounds=name=>({...layout.controls[name],x:layout.controls[name].x-ox,y:layout.controls[name].y-oy});
 loader(parent,'detailIcon',bounds('detailIcon'),'detailSword',{fill:LoaderFillType.Scale});text(parent,'detailTitle',layout.detail.title,bounds('detailTitle'),31,'#eee2cb',{bold:true});text(parent,'rarity',layout.detail.rarity,bounds('rarity'),24,'#74c5e8');
 text(parent,'stats','',bounds('stats'),25,'#c9cbc6',{visible:false});
 layout.detail.stats.forEach((s,i)=>{const rel=r=>({...r,x:r.x-ox,y:r.y-oy});text(parent,'statLabel'+i,s.label,rel(s.labelRect),25,'#c9cbc6');text(parent,'statValue'+i,s.value,rel({...s.valueRect,x:s.valueRect.x-18,width:75}),29,'#e4e4dc',{font:'Times New Roman',align:AlignType.Right});});
 text(parent,'description',layout.detail.description,{...bounds('description'),x:1046-ox,y:563-oy,height:90},19,'#bec0ba',{singleLine:false,leading:10,valign:0});
 button(parent,'primary','装备',bounds('primary'));button(parent,'sell','出售',bounds('sell'),'FidelitySecondaryBtn');
}
detailNodes(main);
for(const key of ['statAttack','statCrit','statDurability','detailDivider','detailLowerDivider','capacityIcon','progressFrame'])image(main,'art_'+key,key);
text(main,'summary','24 / 30',layout.controls.summary,29,'#eee4ce',{font:'Times New Roman'});loader(main,'capacityFill',R(298,901,318,15),'progressFill');
button(main,'sort','稀有度',layout.controls.sort,'FidelitySortBtn');image(main,'sortArrow','sortArrow');button(main,'menu','',layout.controls.menu,'FidelityMenuBtn');
for(const[name,title]of[['save','保存'],['load','恢复'],['reward','旅途奖励']])button(main,name,title,R(0,0,120,40),'FidelitySecondaryBtn').setVisible(false);
text(main,'notice','',R(1047,835,370,22),16,'#bec0ba',{visible:false});text(main,'footer','— 装下旅途的一切，下一段故事仍在前方。 —',layout.controls.footerHint,18,'#72818a',{align:AlignType.Center});
composeTransition(doc,main,{name:'enter',fps:24,autoPlay:false,items:[{time:0,actionType:TransitionActionType.Alpha,tween:true,duration:12,startValue:[0],endValue:[1]}]});
const detail=component('Detail',ids.Detail,433,723);graph(detail,'detailbg',R(0,0,433,723));image(detail,'art_detailBackground','detailBackground',R(0,0,433,723));detailNodes(detail,1017,137);
for(const key of ['statAttack','statCrit','statDurability','detailDivider','detailLowerDivider']){const a=map.skins[key].sourceRect;image(detail,'art_'+key,key,{...a,x:a.x-1017,y:a.y-137});}

const structure={schemaVersion:1,package:map.package,design:layout.design,resources:Object.fromEntries(Object.entries(ids)),components:{},buttonResources:map.buttonResources,grid:{layout:2,columns:6,columnGap:12,lineGap:17,cellWidth:128,cellHeight:137,defaultItem:url(ids.ItemSlot),virtualRequiredAtRuntime:true},referenceLayout:layout,resourceMap:'fidelity-resource-map.json',notes:['Main children are flat. art_ nodes are non-touchable GImages. Native dynamic controls stay separate.','title/subtitle are retained hidden text nodes for compatibility; art_headerBranding is decorative raster lettering.','Masked background holes are canonical only. Adaptive layouts must hide them and use base graphs plus frame-only images.','GList virtualization is enabled by each platform Host; a source XML flag alone does not enable runtime virtualization.']};
for(const c of pkg.listResources().filter(r=>r.propertyType==='Component'&&(Object.values(ids).includes(r.getId())||r.getId().startsWith('fb000'))))structure.components[c.getName()]={id:c.getId(),url:url(c.getId()),width:c.getWidth(),height:c.getHeight(),children:c.listChildren().map(n=>({id:n.getId(),name:n.getName(),type:n.propertyType,x:n.getX(),y:n.getY(),width:n.getWidth(),height:n.getHeight(),visible:n.getVisible(),src:n.getSrc?.()??null,url:n.getUrl?.()??null}))};
map.skinEntries=Object.entries(map.skins).map(([key,entry])=>({key,...entry}));map.componentEntries=Object.entries(map.components).map(([name,entry])=>({name,...entry}));map.buttonEntries=Object.entries(map.buttonResources).map(([name,entry])=>({name,...entry}));
structure.componentEntries=Object.entries(structure.components).map(([name,entry])=>({name,...entry}));
await writeJson('fidelity-resource-map.json',map);await writeJson('fidelity-structure.json',structure);
const stage=path.join(published,'fidelity-staged-project');await fs.mkdir(stage,{recursive:true});await new NodeIO().writeProject(doc,path.join(stage,'Inventory.fairy'));
const changedFiles=['assets/Inventory/package.xml',...Object.keys(structure.components).map(name=>'assets/Inventory/'+name+'.xml'),...[...Object.values(map.skins),...map.details].map(a=>'assets/Inventory/'+a.file)];
for(const f of changedFiles){await fs.mkdir(path.dirname(path.join(projectRoot,f)),{recursive:true});await fs.copyFile(path.join(stage,f),path.join(projectRoot,f));}
const reopened=await new NodeIO().readProject(source),readPkg=reopened.getRoot().getPackageById(packageId);
for(const original of originalEntries){const r=readPkg.getResourceById(original.id);assert(r,'Original ID missing '+original.id);assert.deepEqual({id:r.getId(),name:r.getName(),path:r.getPath(),exported:r.getExported()},original);}
for(const[f,before]of Object.entries(protectedBefore))assert.equal(hash(await fs.readFile(path.join(projectRoot,f))),before,'Protected baseline file changed '+f);
assert.equal(hash(await fs.readFile(path.join(root,'dist/ComplexInventoryApp.txt'))),report.sharedBundleSha256);
for(const image of [...Object.values(map.skins),...map.details]){const r=readPkg.getResourceById(image.id);assert.deepEqual(r.getScale9Grid(),image.scale9Grid);assert.equal(r.getWidth(),image.width);assert.equal(r.getHeight(),image.height);}
const validationResult=await validateProjectNode(source);assert.equal(validationResult.status,'valid',JSON.stringify(validationResult));assert(validationResult.complete);
report.status='passed';report.validation=validationResult;report.preservedOriginalResourceIds=originalEntries.map(e=>e.id);report.sourceResourceCount=readPkg.listResources().length;report.addedImages=Object.keys(map.skins).length+map.details.length;report.protectedAfter=protectedBefore;report.changedFiles=changedFiles;report.sourceFairySha256=hash(await fs.readFile(source));report.sourcePackageSha256=hash(await fs.readFile(path.join(projectRoot,'assets/Inventory/package.xml')));report.completedAt=new Date().toISOString();
await writeJson('fidelity-sync-report.json',report);console.log(JSON.stringify({status:report.status,resources:report.sourceResourceCount,addedImages:report.addedImages,components:Object.keys(structure.components),resourceMap:path.join(published,'fidelity-resource-map.json')},null,2));
