// @ts-nocheck -- Platform adapter for the pinned legacy FairyGUI DOM runtime.
import * as fgui from './vendor/fairygui.module.js';

const W=1586,H=992,base=new URL('./',import.meta.url),app=globalThis.complexInventoryApp,stage=fgui.GRoot.inst;
const metrics={opened:0,closed:0,renders:0,storageSaves:0,storageLoads:0,compositionEvents:[],rowObjectsCreated:0};
const errors=[],controls=new Map(),artObjects=new Map(),rows=[],storageKey='lumio-reference-inventory-schema-1';
let manifest,reference,fixture,detailIcons,main,list,popup,menu,launch,lastRaw='',isOpen=false,scale=1,offsetX=0,offsetY=0;
let popupAction=null,composition=false,noticeValue='',layoutMode='canonical',gridBounds=null,gridColumns=6,cellWidth=128,cellHeight=137,progressMaximum=397.5;
const detailDimensions=new Map(),detailAssets=new Map();let detailPresentation={};
const fallbackSlots=Array.from({length:24},(_,i)=>({index:i,rect:{x:[149,291,431,571,711,852][i%6],y:[222,376,529,682][Math.floor(i/6)],width:124,height:136},quantityRect:{x:91,y:108,width:31,height:26}}));
const rectOf=value=>Array.isArray(value)?{x:value[0],y:value[1],width:value[2],height:value[3]}:value;
const sourceRect=asset=>rectOf(asset?.sourceRect||asset?.rect);
const actualRect=object=>{const r=object.element.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};};
const hex=value=>fgui.Color.fromHexString(value);
const rgba=(r,g,b,a=1)=>new fgui.Color(r/255,g/255,b/255,a);
const mark=(object,name,role)=>{object.name=name;object.element.dataset.testid=name;if(role){object.element.setAttribute('role',role);object.element.setAttribute('aria-label',name);}return object;};
const place=(object,bounds)=>{const r=rectOf(bounds);object.setPosition(r.x,r.y);object.setSize(r.width,r.height);return object;};
function graph(parent,name,r,fill='#06111a',stroke='#94794f',line=0){const g=mark(new fgui.GGraph(),name);place(g,r);g.element.drawRect(line,hex(stroke),hex(fill));g.touchable=false;parent.addChild(g);if(parent===main)artObjects.set(name,g);return g;}
function image(parent,key,r,name=key){
  const asset=manifest.assets[key];if(!asset)throw new Error('Missing reference skin asset: '+key);
  const object=mark(new fgui.GLoader(),name);place(object,r||sourceRect(asset));object.fill=fgui.LoaderFillType.ScaleFree;object.url=new URL(asset.file,base).href;object.touchable=false;parent.addChild(object);if(parent===main)artObjects.set(name,object);return object;
}
function label(parent,name,value,r,size=22,color='#e8dfc9',options={}){
  const object=mark(new fgui.GTextField(),name);object.autoSize=fgui.AutoSizeType.None;place(object,r);
  object.singleLine=options.singleLine!==false;
  Object.assign(object.textFormat,{font:options.font||'SimSun',size,bold:!!options.bold,color:parseInt(color.slice(1),16),align:options.align||'left',verticalAlign:options.verticalAlign||'middle',lineSpacing:options.lineSpacing??5});
  object.applyFormat();object.text=String(value);object.touchable=false;parent.addChild(object);return object;
}
function button(parent,name,title,r,skin,action,options={}){
  const object=mark(new fgui.GButton(),name,'button');place(object,r);parent.addChild(object);
  if(skin&&manifest.assets[skin]){const bg=image(object,skin,{x:0,y:0,width:object.width,height:object.height},name+'-skin');if(layoutMode==='adaptive'&&['primaryBg','secondaryBg','sortBg'].includes(skin))nineSlice(bg,skin,12,true);}
  const text=label(object,name+'-label',title,options.labelRect||{x:0,y:0,width:object.width,height:object.height},options.size||26,options.color||'#e9dfc8',{align:'center',font:options.font||'SimSun',bold:!!options.bold});
  object.__label=text;object.onClick(()=>{try{action();}catch(error){runtimeError(error);}});object.element.tabIndex=0;
  object.element.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(object.touchable)action();}});
  controls.set(name,object);return object;
}
function setLabel(object,value){object.__label.text=String(value);}
function enable(object,value){object.touchable=!!value;object.grayed=!value;object.element.setAttribute('aria-disabled',String(!value));}
function runtimeError(error){errors.push(String(error));console.error(error);}
window.addEventListener('error',event=>errors.push(String(event.error||event.message)));
window.addEventListener('unhandledrejection',event=>errors.push(String(event.reason)));
function state(){return JSON.parse(lastRaw).view;}
function dispatch(op,args={}){lastRaw=app.dispatch(op,JSON.stringify(args));const response=JSON.parse(lastRaw);noticeValue=response.ok?(response.result?.message||''):(response.error||'操作失败');if(isOpen)render();return response;}
function forgetControlTree(owner){
  for(const [name,object] of controls){let parent=object;while(parent){if(parent===owner){controls.delete(name);break;}parent=parent.parent;}}
}
function closePopup(){popupAction=null;if(popup){forgetControlTree(popup);popup.dispose();popup=null;}}
function closeMenu(){if(menu){forgetControlTree(menu);menu.dispose();menu=null;}}
function showPopup(title,message,action=null){
  closePopup();popupAction=action;popup=mark(new fgui.GComponent(),'popup');const cw=layoutMode==='adaptive'?stage.width:W,ch=layoutMode==='adaptive'?stage.height:H;popup.setSize(cw,ch);main.addChild(popup);
  const shade=graph(popup,'popup-shade',{x:0,y:0,width:cw,height:ch},'#000000');shade.alpha=.78;shade.touchable=true;
  const compact=cw<620,w=Math.min(586,cw-24),h=Math.min(compact?450:390,ch-24),x=(cw-w)/2,y=(ch-h)/2,inset=compact?20:50,buttonWidth=compact?(w-52)/2:220,secondX=compact?inset+buttonWidth+12:316;popup.__bounds={x,y,w,h,compact,inset,buttonWidth,secondX};graph(popup,'popup-panel',{x,y,width:w,height:h},'#07151f','#b29b6b',2);
  label(popup,'popup-title',title,{x:x+(compact?20:28),y:y+24,width:w-(compact?40:56),height:42},compact?26:32,'#f2dcb3');
  label(popup,'popup-body',message,{x:x+(compact?20:28),y:y+(compact?76:83),width:w-(compact?40:56),height:compact?h-166:210},compact?18:24,'#d5d3c7',{verticalAlign:'top',lineSpacing:compact?6:8,singleLine:false});
  button(popup,'confirm',action?'确认':'关闭',{x:x+inset,y:y+h-72,width:buttonWidth,height:48},'primaryBg',()=>{const run=popupAction;closePopup();if(run)run();},{size:compact?22:25,color:'#241a0e'});
  button(popup,'cancel',action?'取消':'返回',{x:x+secondX,y:y+h-72,width:buttonWidth,height:48},'secondaryBg',closePopup,{size:compact?22:25});
}
function rewardsPopup(message=''){
  const rewards=state().rewards,counts={locked:0,ready:0,claimed:0};for(const item of rewards.items)counts[item.state]++;
  showPopup('旅途奖励',`${message?message+'\n':''}共30项：未达成 ${counts.locked} · 可领取 ${counts.ready} · 已领取 ${counts.claimed}\n每项奖励仅可领取一次，获得10金币。`);
  const {x,y,w,h,compact,inset,buttonWidth,secondX}=popup.__bounds;
  if(compact){const body=popup.getChild('popup-body');body.height=h-236;}
  button(popup,'reward-progress','推进进度',{x:x+inset,y:y+h-(compact?142:180),width:buttonWidth,height:42},'secondaryBg',()=>{dispatch('progress');rewardsPopup();},{size:compact?20:22});
  const claim=button(popup,'reward-claim','领取一项',{x:x+(compact?secondX:w-270),y:y+h-(compact?142:180),width:buttonWidth,height:42},'secondaryBg',()=>{const item=state().rewards.items.find(item=>item.state==='ready');if(item){const result=dispatch('claim',{id:item.id});rewardsPopup(result.result?.message||result.error);}},{size:compact?20:22});
  enable(claim,rewards.items.some(item=>item.state==='ready'));
}
function saveFile(){const result=dispatch('save');if(result.ok){try{localStorage.setItem(storageKey,result.result.json);metrics.storageSaves++;noticeValue='背包已保存';}catch(error){storageError('storage_write_failed',error);}}}
function loadFile(){try{const json=localStorage.getItem(storageKey);if(json===null){storageError('storage_missing','尚无保存的背包');return;}if(dispatch('load',{json}).ok)metrics.storageLoads++;}catch(error){storageError('storage_read_failed',error);}}
function storageError(errorCode,error){lastRaw=JSON.stringify({...JSON.parse(app.snapshot()),ok:false,op:'storage',result:null,errorCode,error:String(error)});noticeValue=String(error);}
function toggleMenu(){
  if(menu){closeMenu();return;}
  menu=mark(new fgui.GComponent(),'menu-panel');main.addChild(menu);menu.setPosition(layoutMode==='adaptive'?stage.width-257:1200,layoutMode==='adaptive'?stage.height-228:696);menu.setSize(245,177);graph(menu,'menu-panel-bg',{x:0,y:0,width:245,height:177},'#07151f','#ab8a56',1);
  for(const [index,[name,title,action]] of [['menu_save','保存背包',saveFile],['menu_load','恢复背包',loadFile],['menu_reward','旅途奖励',()=>rewardsPopup()]].entries())button(menu,name,title,{x:8,y:8+index*54,width:229,height:48},'secondaryBg',()=>{toggleMenu();action();},{size:23});
}
function showSort(){
  closeMenu();
  menu=mark(new fgui.GComponent(),'sort-menu');main.addChild(menu);menu.setPosition(layoutMode==='adaptive'?stage.width-276:1141,layoutMode==='adaptive'?stage.height-336:590);menu.setSize(216,285);graph(menu,'sort-menu-bg',{x:0,y:0,width:216,height:285},'#07151f','#ab8a56',1);
  for(const [index,[sort,title]] of [['default','默认顺序'],['name','名称'],['rarity','稀有度'],['price','价格'],['quantity','数量']].entries())button(menu,'sort_'+sort,title+(state().sort===sort?' ✓':''),{x:6,y:6+index*55,width:204,height:49},'secondaryBg',()=>{closeMenu();dispatch('sort',{sort});},{size:23});
}
function renderGrid(){
  for(const row of rows)row.dispose();rows.length=0;
  const items=state().visible,slots=reference.slots?.length?reference.slots:fallbackSlots;
  for(let index=0;index<items.length;index++){
    const item=items[index],location=slots[index%24],skin=slots.find(slot=>slot.kind===item.kind)||slots[item.iconIndex]||fallbackSlots[item.iconIndex];
    const r=layoutMode==='adaptive'?{x:gridBounds.x+(index%gridColumns)*(cellWidth+8),y:gridBounds.y+Math.floor(index/gridColumns)*(cellHeight+8),width:cellWidth,height:cellHeight}:rectOf(location.rect);
    const listRect=gridBounds||reference.controls.list;
    const row=mark(new fgui.GComponent(),'item-slot','button');row.setPosition(r.x-listRect.x,r.y-listRect.y+(layoutMode==='canonical'&&index>=24?610:0));row.setSize(r.width,r.height);row.data=item.id;row.element.dataset.itemId=item.id;row.element.setAttribute('aria-label',`${item.name} ${item.quantity}件`);list.addChild(row);rows.push(row);metrics.rowObjectsCreated++;
    image(row,skin.asset||`slot${String(item.iconIndex).padStart(2,'0')}`,{x:0,y:0,width:r.width,height:r.height},'item-art');
    const source=manifest.assets[skin.asset||`slot${String(item.iconIndex).padStart(2,'0')}`],original={width:source.width,height:source.height};
    if(item.id===state().selectedId&&manifest.assets.slotSelectedFrame){const frame=manifest.assets.slotSelectedFrame;image(row,'slotSelectedFrame',{x:(frame.placementOffset?.x||0)*r.width/original.width,y:(frame.placementOffset?.y||0)*r.height/original.height,width:frame.width*r.width/original.width,height:frame.height*r.height/original.height},'selected-frame');}
    const q=rectOf(skin.quantityRect||{x:original.width-35,y:original.height-29,width:33,height:27});
    const qr={x:q.x*r.width/original.width,y:q.y*r.height/original.height,width:q.width*r.width/original.width,height:q.height*r.height/original.height};
    const narrow=layoutMode==='adaptive'&&stage.width<700,quantityBox=layoutMode==='adaptive'?(narrow?{x:3,y:r.height-22,width:Math.max(16,r.width-6),height:22}:{x:Math.max(0,r.width-48),y:r.height-25,width:42,height:24}):{x:qr.x-20,y:qr.y-5,width:qr.width+18,height:28};
    graph(row,'quantity-mask',qr,'#050e14');label(row,'quantity',item.quantity,quantityBox,layoutMode==='adaptive'?(narrow?16:18):24,'#f0eee0',{font:'Times New Roman',align:'right',lineSpacing:0});
    row.onClick(()=>dispatch('select',{id:row.data}));
  }
}
function render(){
  if(!isOpen||!main)return;metrics.renders++;const view=state();renderGrid();
  controls.get('coins').text=view.coins.toLocaleString('en-US');
  const selected=view.selected;
  controls.get('detailTitle').text=selected?.name||'选择一件道具';
  const rarityName=selected?{common:'普通',uncommon:'优秀',rare:'稀有',epic:'史诗',legendary:'传说'}[selected.rarity]:'',typeName=selected?(selected.slot==='weapon'?'武器':{equipment:'装备',consumable:'消耗品',material:'材料',quest:'任务物品'}[selected.type]):'';
  controls.get('rarity').text=selected?(layoutMode==='adaptive'&&stage.width<700?[rarityName,typeName,selected.equipped?'已装备':null].filter(Boolean).join('\n'):`${rarityName} · ${typeName}${selected.equipped?' · 已装备':''}`):'';
  controls.get('description').text=selected?.description||'点击道具查看详情';
  const stats=Object.entries(selected?.stats||{}).slice(0,3),names={attack:'攻击',crit:'暴击',durability:'耐久',defense:'防御',health:'生命',mana:'法力',stamina:'耐力'};
  for(const [index,key] of ['attack','crit','durability'].entries()){
    const entry=stats[index],label=controls.get('stat-label-'+key),value=controls.get('stat_'+key);
    label.visible=value.visible=!!entry;
    label.text=entry?(names[entry[0]]||entry[0]):'';
    value.text=entry?(entry[0]==='durability'?String(entry[1]):`+${entry[1]}${entry[0]==='crit'?'%':''}`):'';
  }
  const originalSword=selected?.kind==='sword';
  controls.get('stats-background-mask').visible=!originalSword;
  for(const name of ['statAttack','statCrit','statDurability'])if(artObjects.has(name))artObjects.get(name).visible=originalSword;
  const note=controls.get('itemNote');note.visible=!!selected&&!stats.length;note.text=selected?.type==='quest'?'任务物品\n不可使用 · 不可交易':selected?.type==='material'?'制作材料\n可出售 · 不可直接使用':'此道具没有额外属性';
  const detail=controls.get('detailIcon');
  detail.fill=fgui.LoaderFillType.Scale;detail.align='center';detail.verticalAlign='middle';
  const detailAsset=selected?detailAssets.get(selected.iconIndex):null,detailFile=originalSword?manifest.assets.detailSword.file:detailAsset?.file;
  detail.url=selected?new URL(detailFile,base).href:'';
  const natural=originalSword?{width:194,height:392}:detailDimensions.get(selected?.iconIndex);
  if(natural){detail.sourceWidth=natural.width;detail.sourceHeight=natural.height;detail.fill=fgui.LoaderFillType.None;detail.fill=fgui.LoaderFillType.Scale;}
  detail.element.dataset.assetSource=originalSword?'reference-tall-sword':'derived-transparent-item';
  detailPresentation={id:selected?.id||null,kind:selected?.kind||null,url:detail.url,assetFile:detailFile,source:detail.element.dataset.assetSource,preserveAspect:true,naturalSize:natural,stats:stats.map(([key,value])=>({key,label:names[key]||key,value})),note:note.visible?note.text:''};
  controls.get('summary').text=`${view.usedSlots} / ${view.capacity}`;
  const fill=controls.get('capacity-fill');fill.width=progressMaximum*Math.min(1,view.usedSlots/view.capacity);
  const primary=controls.get('primary'),sell=controls.get('sell');
  setLabel(primary,selected?.equipped?'卸下':selected?.type==='equipment'?'装备':selected?.type==='consumable'?'使用':'不可使用');setLabel(sell,selected?.type==='quest'?'不可交易':'出售');
  enable(primary,selected&&(selected.equipped||selected.type==='equipment'||selected.type==='consumable'));enable(sell,selected&&!selected.equipped&&selected.type!=='quest');
  if(layoutMode==='adaptive')for(const [name,iconKey] of [['primary','compass'],['sell','sellCoins']]){const button=controls.get(name);centerAction(name,iconKey,{x:button.x,y:button.y,width:button.width,height:button.height});}
  for(const category of ['all','equipment','consumable','material','quest']){const tab=controls.get('tab_'+category),skin=view.category===category?'tabSelectedBg':'tabNormalBg';tab.__bg.url=new URL(manifest.assets[skin].file,base).href;if(layoutMode==='adaptive')nineSlice(tab.__bg,skin,8,true);}
  setLabel(controls.get('sort'),{default:'稀有度',name:'名称',rarity:'稀有度',price:'价格',quantity:'数量'}[view.sort]);
  const search=controls.get('search');if(!composition&&search.text!==view.query)search.text=view.query;
}
function addText(name,value,r,size,color,options){const object=label(main,name,value,r,size,color,options);controls.set(name,object);return object;}
function createMain(){
  controls.clear();artObjects.clear();main=mark(new fgui.GComponent(),'inventory');main.setSize(W,H);stage.addChild(main);
  for(const key of ['environmentLeft','environmentRight','environmentTop','environmentBottom'])if(manifest.assets[key])image(main,key);
  if(manifest.assets.headerLeftMiddle){
    for(const key of ['headerLeftMiddle','headerRightLower','headerRightUpper'])image(main,key);
    const blank=manifest.assets.headerCoinBlank;image(main,'headerCoinBlank',blank.intendedFillRect||{x:1113,y:17,width:183,height:45});
  }else if(manifest.assets.headerFill)image(main,'headerFill');
  for(const [name,key] of [['left','leftBackground'],['footer','footerBackground']]){
    if(manifest.assets[key]){graph(main,name+'-background-base',reference.panels[name],'#041019');image(main,key);}
    else if(manifest.assets.panelFill)image(main,'panelFill',reference.panels[name],'panel-fill-'+name);
  }
  if(manifest.assets.detailBackground){graph(main,'detail-background-base',reference.panels.right,'#041019');image(main,'detailBackground');}
  else if(manifest.assets.panelFill)image(main,'panelFill',reference.panels.right,'panel-fill-right');
  for(const key of ['frameLeft','frameRight','frameFooter'])if(manifest.assets[key])image(main,key);
  if(manifest.assets.headerBranding){const logo=image(main,'headerBranding',null,'title');logo.element.dataset.imageSource='reference-wordmark';logo.element.setAttribute('aria-label','旅者背包');controls.set('title',logo);}
  else addText('title','旅者背包',{x:264,y:38,width:222,height:56},52,'#eed7ad');
  if(manifest.assets.coin)image(main,'coin');
  addText('coins','12,480',reference.controls.coins,32,'#f5e5c9',{font:'Times New Roman'});
  const closeRect=reference.controls?.close||{x:1374,y:20,width:34,height:34};button(main,'close','',closeRect,'close',close);
  const searchRect=reference.controls?.search||{x:150,y:155,width:297,height:45};if(manifest.assets.searchBg)image(main,'searchBg',searchRect);
  const input=mark(new fgui.GTextInput(),'search');place(input,reference.controls.searchText||{x:searchRect.x+58,y:searchRect.y+5,width:searchRect.width-66,height:searchRect.height-10});input.autoSize=fgui.AutoSizeType.None;
  Object.assign(input.textFormat,{font:'SimSun',size:23,color:0xd7d5c8});input.singleLine=true;input.applyFormat();input.setPromptText('搜索物品……');main.addChild(input);controls.set('search',input);
  const native=input.element.htmlInput;native.dataset.testid='search';native.setAttribute('aria-label','搜索物品');
  const commit=()=>{if(state().query!==input.text)dispatch('query',{query:input.text});};
  native.addEventListener('compositionstart',()=>{composition=true;metrics.compositionEvents.push('start');});native.addEventListener('compositionend',()=>{composition=false;metrics.compositionEvents.push('end');commit();});input.on('changed',()=>{if(!composition)commit();});
  for(const [index,[category,title]] of Object.entries({all:'全部',equipment:'装备',consumable:'消耗品',material:'材料',quest:'任务'}).entries()){
    const r=reference.controls?.['tab_'+category]||{x:[466,574,677,785,890][index],y:157,width:[99,96,100,98,95][index],height:43};
    const tab=button(main,'tab_'+category,title,r,null,()=>dispatch('category',{category}),{size:23});tab.__bg=image(tab,'tabNormalBg',{x:0,y:0,width:r.width,height:r.height},'tab-skin');tab.setChildIndex(tab.__bg,0);
  }
  list=mark(new fgui.GComponent(),'list');place(list,reference.controls.list);list.touchable=true;main.addChild(list);controls.set('list',list);
  const d=reference.detail||{};
  const detailImage=image(main,'detailSword',reference.controls.detailIcon,'detailIcon');controls.set('detailIcon',detailImage);
  addText('detailTitle','霜纹长剑',reference.controls.detailTitle,31,'#eee2cb',{bold:true});
  addText('rarity','稀有 · 武器',reference.controls.rarity,24,'#74c5e8');
  const statsMask=graph(main,'stats-background-mask',{x:1230,y:330,width:194,height:183},'#041019');controls.set('stats-background-mask',statsMask);
  const statYs=[337,395,452];for(const [index,[key,title]] of [['attack','攻击'],['crit','暴击'],['durability','耐久']].entries()){
    addText('stat-label-'+key,title,d.stats[index].labelRect,25,'#c9cbc6');
    addText('stat_'+key,'',{...d.stats[index].valueRect,x:d.stats[index].valueRect.x-18,width:75},29,'#e4e4dc',{font:'Times New Roman',align:'right'});
    if(!manifest.assets.detailBackground)graph(main,'stat-rule-'+key,{x:1235,y:statYs[index]+44,width:181,height:1},'#48504f');
  }
  addText('itemNote','',{x:1238,y:348,width:180,height:145},21,'#bec0ba',{singleLine:false,verticalAlign:'top',lineSpacing:10});
  addText('description','',{...reference.controls.description,x:1046,y:563,height:90},19,'#bec0ba',{verticalAlign:'top',lineSpacing:10,singleLine:false});
  const primary=button(main,'primary','装备',reference.controls?.primary||{x:1048,y:686,width:367,height:64},'primaryBg',()=>{const selected=state().selected;if(selected)dispatch(selected.equipped?'unequip':selected.type==='equipment'?'equip':'use',selected.equipped?{slot:selected.slot}:{id:selected.id});},{size:28,bold:true,color:'#251b0c',labelRect:{x:reference.controls.primaryText.x-reference.controls.primary.x,y:reference.controls.primaryText.y-reference.controls.primary.y,width:reference.controls.primaryText.width,height:reference.controls.primaryText.height}});
  button(main,'sell','出售',reference.controls?.sell||{x:1048,y:763,width:367,height:62},'secondaryBg',()=>{const item=state().selected;if(item)showPopup('确认出售',`出售「${item.name}」 ×1\n获得 ${item.price} 金币。`,()=>dispatch('sell',{id:item.id,quantity:1}));},{size:29,labelRect:{x:158,y:0,width:116,height:62}});
  for(const key of ['compass','sellCoins','statAttack','statCrit','statDurability','searchIcon','detailDivider','detailLowerDivider','capacityIcon'])if(manifest.assets[key])image(main,key);
  addText('summary','24 / 30',reference.controls.summary,29,'#eee4ce',{font:'Times New Roman'});
  if(manifest.assets.progressFrame)image(main,'progressFrame');else graph(main,'capacity-outline',reference.controls.progress,'#07131c','#54616a',1);
  const fill=manifest.assets.progressFill?image(main,'progressFill',{x:299,y:901,width:330,height:14},'capacity-fill'):graph(main,'capacity-fill',{x:299,y:901,width:330,height:14},'#dda843','#e5c276',1);controls.set('capacity-fill',fill);
  button(main,'sort','稀有度',reference.controls.sort,'sortBg',showSort,{size:27,labelRect:{x:8,y:0,width:134,height:49}});
  if(manifest.assets.sortArrow)image(main,'sortArrow');
  button(main,'menu','',reference.controls.menu,'menu',toggleMenu,{font:'Arial',size:34});
  addText('footer','— 装下旅途的一切，下一段故事仍在前方。 —',reference.controls.footerHint,18,'#72818a',{align:'center'});
}
function nineSlice(object,key,border=12,fill=false){
  const asset=manifest.assets[key],slices=asset.borderImage?.slice||asset.insets||[border,border,border,border];
  if(slices[0]+slices[2]>=asset.height||slices[1]+slices[3]>=asset.width)throw new Error('Invalid nine-slice center: '+key);
  const widths=slices.map(value=>value+'px').join(' '),element=object.element;element.classList.add('nine-slice-art');
  element.dataset.skinAsset=key;
  Object.assign(element.style,{boxSizing:'border-box',borderStyle:'solid',borderWidth:widths,borderColor:'transparent',borderImageSource:`url("${new URL(asset.file,base).href}")`,borderImageSlice:slices.join(' ')+(fill?' fill':''),borderImageWidth:widths,borderImageRepeat:'stretch'});
}
function moveControl(name,r,size,lineSpacing){
  const object=controls.get(name);if(!object)return;place(object,r);object.visible=true;
  if(size&&object.textFormat){const value=object.text;object.textFormat.size=size;if(lineSpacing!==undefined)object.textFormat.lineSpacing=lineSpacing;object.applyFormat();object.text='';object.text=value;}
}
function moveButton(name,r,size=20,labelRect=null){
  const object=controls.get(name);place(object,r);object.visible=true;
  const bg=object.__bg||object.getChild(name+'-skin');
  const key={primary:'primaryBg',sell:'secondaryBg',sort:'sortBg'}[name];
  if(bg){place(bg,{x:0,y:0,width:r.width,height:r.height});if(key)nineSlice(bg,key,12,true);}
  const label=object.__label;place(label,labelRect||{x:0,y:0,width:r.width,height:r.height});const value=label.text;label.textFormat.size=size;label.applyFormat();label.text='';label.text=value;
}
function centerAction(name,iconKey,buttonRect){
  const object=controls.get(name),icon=artObjects.get(iconKey),assetKey=manifest.assets[iconKey+'Alpha']?iconKey+'Alpha':iconKey,asset=manifest.assets[assetKey];
  const textRange=document.createRange();textRange.selectNodeContents(object.__label.element.querySelector('.fgui-text')||object.__label.element);
  const textWidth=Math.ceil(textRange.getBoundingClientRect().width+4),iconHeight=buttonRect.height*(name==='primary'?39/64:33/62),iconWidth=iconHeight*asset.width/asset.height,gap=12,groupWidth=iconWidth+gap+textWidth,start=(buttonRect.width-groupWidth)/2;
  place(object.__label,{x:start+iconWidth+gap,y:0,width:textWidth,height:buttonRect.height});
  moveArt(iconKey,{x:buttonRect.x+start,y:buttonRect.y+(buttonRect.height-iconHeight)/2,width:iconWidth,height:iconHeight});
  icon.url=new URL(asset.file,base).href;icon.sourceWidth=asset.width;icon.sourceHeight=asset.height;icon.fill=fgui.LoaderFillType.None;icon.fill=fgui.LoaderFillType.Scale;icon.align='center';icon.verticalAlign='middle';
  icon.element.dataset.skinAsset=assetKey;object.element.dataset.contentLayout='icon-label';
}
function moveArt(name,r,key=name,border=0,fill=false){const object=artObjects.get(name);if(!object)return;place(object,r);object.visible=true;if(border)nineSlice(object,key,border,fill);}
function applyAdaptive(layout){
  gridColumns=layout.columns;gridBounds=layout.gridBounds;cellWidth=layout.cellWidth;cellHeight=layout.cellHeight;progressMaximum=layout.progressMaximum;
  for(const object of artObjects.values())object.visible=false;
  for(const node of layout.art){
    const object=artObjects.get(node.name);if(!object||!node.visible)continue;
    moveArt(node.name,node,node.skin||node.asset||node.name,node.border||0,!!node.fillCenter);
    if(node.asset&&manifest.assets[node.asset]&&node.url){object.url=new URL(manifest.assets[node.asset].file,base).href;object.sourceWidth=node.sourceWidth;object.sourceHeight=node.sourceHeight;object.fill=fgui.LoaderFillType.None;object.fill=fgui.LoaderFillType.Scale;object.align=node.align;object.verticalAlign=node.verticalAlign;object.element.dataset.skinAsset=node.asset;}
  }
  for(const node of layout.controls){
    const object=controls.get(node.name);if(!object)continue;
    if(node.button)moveButton(node.name,node,node.fontSize,node.labelRect);else moveControl(node.name,node,node.fontSize,node.lineSpacing);
    object.visible=node.visible;
    if(object.textFormat)object.singleLine=node.singleLine;
    if(node.fill==='scale')object.fill=fgui.LoaderFillType.Scale;
  }
}
function resize(){
  closePopup();closeMenu();if(!manifest||!reference)return;
  const layout=globalThis.fidelityLayout(stage.width,stage.height,reference,manifest),next=layout.mode;
  if(main&&next!==layoutMode){closePopup();closeMenu();main.dispose();main=null;rows.length=0;controls.clear();composition=false;layoutMode=next;createMain();}else layoutMode=next;
  if(layoutMode==='adaptive'){
    scale=1;offsetX=offsetY=0;if(main){main.setScale(1,1);main.setPosition(0,0);main.setSize(stage.width,stage.height);applyAdaptive(layout);}
  }else{
    gridColumns=6;gridBounds=null;progressMaximum=397.5;scale=Math.min(stage.width/W,stage.height/H);offsetX=(stage.width-W*scale)/2;offsetY=(stage.height-H*scale)/2;if(main){main.setScale(scale,scale);main.setPosition(offsetX,offsetY);}
  }
  if(main)render();if(launch)launch.setPosition(20,20);
}
function open(){if(isOpen)return;lastRaw=app.dispatch('open','{}');isOpen=true;createMain();resize();render();metrics.opened++;if(launch){launch.dispose();launch=null;}}
function close(){if(!isOpen)return;closePopup();closeMenu();main.dispose();main=null;rows.length=0;controls.clear();isOpen=false;lastRaw=app.dispatch('close','{}');metrics.closed++;
  launch=button(stage,'launch','打开旅者背包',{x:20,y:20,width:240,height:54},'secondaryBg',open,{size:25});}
function snapshot(){const detailContent=controls.get('detailIcon')?.element?.firstElementChild,detailRect=detailContent?.getBoundingClientRect();return{ready:verification.ready,response:lastRaw?JSON.parse(lastRaw):null,rawTsResponse:lastRaw,ui:{open:isOpen,popup:!!popup,menu:!!menu,screenWidth:stage.width,screenHeight:stage.height,physicalRows:rows.length,virtualItems:lastRaw?state().visible.length:0,virtualList:false,scrollY:0,title:'旅者背包',detail:{...detailPresentation,imageRect:detailRect?{x:detailRect.x,y:detailRect.y,width:detailRect.width,height:detailRect.height}:null},fidelity:{mode:layoutMode,variant:layoutMode==='adaptive'?(stage.width<700?'narrow':'split'):'reference',columns:gridColumns,canonical:{width:W,height:H},scale,offsetX,offsetY,mainRect:main?actualRect(main):null,referenceSha256:manifest?.reference?.sha256},
  controls:[...controls].map(([name,object])=>({name,rect:actualRect(object),enabled:object.touchable,visible:object.visible})),controlRects:Object.fromEntries([...controls].map(([name,object])=>[name,actualRect(object)])),rows:rows.map(row=>({id:row.data,rect:actualRect(row)})),notice:noticeValue},metrics:{...metrics},errors:[...errors]};}
const verification=globalThis.complexVerification={ready:false,snapshot,async command(op,argsJson='{}'){
  let args;try{args=JSON.parse(argsJson);}catch{lastRaw=app.dispatch(op,argsJson);return snapshot();}
  if(!args||typeof args!=='object'||Array.isArray(args)){lastRaw=app.dispatch(op,argsJson);return snapshot();}
  try{switch(op){case'open':open();break;case'close':close();break;case'confirm':{const run=popupAction;closePopup();if(run)run();break;}case'cancel':closePopup();break;case'popup':rewardsPopup();break;case'menu':toggleMenu();break;case'save-file':saveFile();break;case'load-file':loadFile();break;case'scroll':break;default:dispatch(op,args);}}catch(error){runtimeError(error);}
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));return snapshot();
}};
globalThis.verification=verification;
window.addEventListener('resize',resize);
try{
  if(!app?.dispatch)throw new Error('Shared complexInventoryApp IIFE is missing');
  const read=async name=>{const response=await fetch(new URL(name,base));if(!response.ok)throw new Error('Missing fidelity '+name);return response.json();};
  [manifest,reference,fixture,detailIcons]=await Promise.all([read('skin-manifest.json'),read('layout-reference.json'),read('reference-fixture.json'),read('detail-icons.json')]);
  await Promise.all(Object.values(manifest.assets).map(async asset=>{const image=new Image();image.src=new URL(asset.file,base).href;await image.decode();}));
  await Promise.all(Array.from({length:24},async(_,index)=>{const asset=detailIcons.entries.find(entry=>entry.index===index);if(!asset?.file)throw new Error('Missing detail icon manifest entry: '+index);detailAssets.set(index,asset);const image=new Image();image.src=new URL(asset.file,base).href;await image.decode();detailDimensions.set(index,{width:image.naturalWidth,height:image.naturalHeight});}));
  await document.fonts.ready;
  lastRaw=app.dispatch('load',JSON.stringify({json:JSON.stringify(fixture)}));if(!JSON.parse(lastRaw).ok)throw new Error('Reference fixture was rejected: '+lastRaw);
  open();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));verification.ready=true;
}catch(error){document.getElementById('failure').textContent=String(error);verification.failure=String(error);runtimeError(error);}
