// @ts-nocheck -- Fixed legacy FairyGUI DOM bundle has no shipped declarations.
import * as fgui from './vendor/fairygui.module.js';
import '../scripts/layout.js';

const app=globalThis.complexInventoryApp;
const stage=fgui.GRoot.inst;
const storageKey='lumio-complex-inventory-schema-1';
const palette={common:'#8f9ca8',uncommon:'#54b775',rare:'#55a9e8',epic:'#b77bea',legendary:'#e6ad45'};
const rarityNames={common:'普通',uncommon:'优秀',rare:'稀有',epic:'史诗',legendary:'传说'};
const categoryNames={all:'全部',equipment:'装备',consumable:'消耗',material:'材料',quest:'任务'};
const sortNames={default:'默认',name:'名称',rarity:'品质',price:'价格',quantity:'数量'};
const metrics={opened:0,closed:0,renders:0,rowRenderCalls:0,rowObjectsCreated:0,closedCallbacks:0,compositionEvents:[],storageSaves:0,storageLoads:0,dragEnds:0};
const errors=[];
window.addEventListener('error',event=>{errors.push(String(event.error || event.message));});
window.addEventListener('unhandledrejection',event=>{errors.push(String(event.reason));});
let view=null,popup=null,shade=null,releaseInput=()=>{},resize=()=>{},layout=null,visible=[],lastRaw='',pendingConfirm=null,popupMode='';
let noticeText='',noticeError=false,manifest=null,pkg=null;
const color=value=>fgui.Color.fromHexString(value);
const child=name=>view?.getChild(name);
const mark=(object,name,role)=>{
  if(!object) throw new Error('Missing published component: '+name);
  object.element.dataset.testid=name;
  if(role){object.element.setAttribute('role',role);object.element.setAttribute('aria-label',object.title || name);}
};
const text=(object,value)=>{object.text=String(value);};
const format=(object,size,hex)=>{
  if(!object?.textFormat)return;
  if(size)object.textFormat.size=size;
  if(hex)object.textFormat.color=parseInt(hex.slice(1),16);
  object.applyFormat();
};
const draw=(object,line,stroke,fill)=>object.element.drawRect(line,color(stroke),color(fill));
const buttonSize=(button,width,height,fontSize)=>{
  button.setSize(width,height);
  const bg=button.getChild('btnbg'),title=button.getChild('title');
  if(bg)bg.setSize(width,height);
  if(title){
    const value=title.text;
    title.textFormat.align='center';title.textFormat.verticalAlign='middle';
    title.setPosition(2,0);title.setSize(Math.max(1,width-4),height);format(title,fontSize);
    // This fixed runtime recomputes vertical placement when text changes.
    title.text='';title.text=value;
  }
};
const enabled=(object,value)=>{
  object.touchable=!!value;object.grayed=!value;
  object.element.setAttribute('aria-disabled',String(!value));
};
const bind=(object,name,action)=>{mark(object,name,'button');object.onClick(()=>{try{action();}catch(error){runtimeError(error);}});};
function runtimeError(error){const message=String(error);errors.push(message);notice(message,true);console.error(error);}
function notice(message,isError=false){noticeText=message;noticeError=isError;if(child('notice')){text(child('notice'),message);format(child('notice'),0,isError?'#ff9f8a':'#e8d5a5');}}
function updateRaw(op,args={}){
  lastRaw=app.dispatch(op,JSON.stringify(args));
  const response=JSON.parse(lastRaw);
  if(!response.ok)notice(response.error || response.errorCode,true);
  render();
  return response;
}
function perform(op,args={}){
  const response=updateRaw(op,args);
  if(response.ok){notice(response.result?.message || ({query:'',category:'',sort:'',select:''}[op] ?? '操作完成'));}
  return response;
}
function iconUrl(item){
  const id=`icx${String(item.iconIndex).padStart(5,'0')}`;
  if(!manifest.packages[pkg.id].images[id] || !pkg.getItemById(id))throw new Error('Missing published icon '+id);
  return `ui://${pkg.id}${id}`;
}
function closePopup(){pendingConfirm=null;popupMode='';if(popup){popup.dispose();popup=null;}if(shade){shade.dispose();shade=null;}}
function popupButton(label,name,x,y,width,action){
  const button=fgui.UIPackage.createObject('Inventory','ComplexBtn');popup.addChild(button);button.title=label;button.setPosition(x,y);buttonSize(button,width,38,16);bind(button,name,action);return button;
}
function showPopup(title,message,action=null,mode='message'){
  closePopup();popupMode=mode;pendingConfirm=action;
  shade=new fgui.GGraph();shade.setSize(stage.width,stage.height);shade.element.drawRect(0,fgui.Color.CLEAR,new fgui.Color(0,0,0,0.7));stage.addChild(shade);
  popup=fgui.UIPackage.createObject('Inventory','Reward');stage.addChild(popup);mark(popup,'popup');
  const width=Math.min(510,stage.width-24),height=mode==='rewards'?410:330;
  popup.setSize(width,height);popup.setPosition((stage.width-width)/2,Math.max(8,(stage.height-height)/2));
  popup.getChild('rewardbg').setSize(width,height);
  const titleObject=popup.getChild('title'),body=popup.getChild('body'),confirm=popup.getChild('confirm');
  titleObject.setPosition(20,18);titleObject.setSize(width-40,40);text(titleObject,title);format(titleObject,width<420?21:26);
  body.setPosition(20,70);body.setSize(width-40,mode==='rewards'?218:166);text(body,message);format(body,width<420?14:17);
  confirm.setPosition((width-132)/2,height-54);buttonSize(confirm,132,36,17);confirm.title=action?'确认出售':'关闭';
  bind(confirm,'confirm',()=>{const accepted=pendingConfirm;closePopup();if(accepted)accepted();});
  popup.draggable=true;popup.on('drag_end',()=>metrics.dragEnds++);
  if(mode==='rewards'){
    popupButton('推进进度','reward-progress',20,height-108,(width-48)/2,()=>{perform('progress');showRewards();});
    const ready=JSON.parse(lastRaw).view.rewards.items.find(item=>item.state==='ready');
    const claim=popupButton('领取一项','reward-claim',28+(width-48)/2,height-108,(width-48)/2,()=>{const state=JSON.parse(lastRaw).view.rewards;const target=state.items.find(item=>item.state==='ready');if(target){const result=perform('claim',{id:target.id});showRewards(result.result?.message);}});
    enabled(claim,!!ready);
  }
}
function showRewards(message=''){
  const rewards=JSON.parse(lastRaw).view.rewards;
  const counts={locked:0,ready:0,claimed:0};for(const item of rewards.items)counts[item.state]++;
  const rows=rewards.items.slice(0,6).map(item=>`${item.name}  ·  ${{locked:'未达成',ready:'可领取',claimed:'已领取'}[item.state]}`);
  showPopup('旅途任务奖励',`${message?message+'\n\n':''}全部 ${rewards.items.length} 项 · 未达成 ${counts.locked} · 可领取 ${counts.ready} · 已领取 ${counts.claimed}\n${rows.join('\n')}\n每次领取一项奖励，获得10金币。`,null,'rewards');
}
function sellSelected(){
  const item=JSON.parse(lastRaw).view.selected;
  if(!item)return;
  showPopup('确认出售',`出售「${item.name}」 ×1\n获得 ${item.price} 金币。\n当前拥有 ${item.quantity} 件。`,()=>perform('sell',{id:item.id,quantity:1}),'sell');
}
function saveFile(){
  const response=updateRaw('save');
  if(!response.ok)return;
  try{localStorage.setItem(storageKey,response.result.json);metrics.storageSaves++;notice('背包已保存到此浏览器');}
  catch(error){storageFailure('save-file','storage_write_failed','保存失败：'+String(error));}
}
function loadFile(){
  try{
    const json=localStorage.getItem(storageKey);
    if(json===null){storageFailure('load-file','storage_missing','此浏览器尚无背包存档');return;}
    const response=perform('load',{json});if(response.ok){metrics.storageLoads++;notice('已恢复此浏览器保存的背包');}
  }catch(error){storageFailure('load-file','storage_read_failed','读取失败：'+String(error));}
}
function storageFailure(op,errorCode,error){
  const current=JSON.parse(app.snapshot());lastRaw=JSON.stringify({...current,op,ok:false,result:null,errorCode,error});notice(error,true);
}
function renderRow(index,row){
  const item=visible[index];if(!item)return;
  metrics.rowRenderCalls++;row.data=item.id;row.element.dataset.itemId=item.id;mark(row,'item-slot','button');
  row.element.setAttribute('aria-label',`${item.name}，${rarityNames[item.rarity]}，${item.quantity}件`);
  const size=layout.cellSize;row.setSize(size,size);
  const border=row.getChild('border'),tile=row.getChild('tile'),selected=row.getChild('selected'),icon=row.getChild('icon'),label=row.getChild('label'),quantity=row.getChild('quantity');
  border.setSize(size,size);draw(border,2,palette[item.rarity],'#111d29');
  tile.setPosition(2,2);tile.setSize(size-4,size-4);draw(tile,0,'#111d29','#152536');
  icon.setPosition(8,6);icon.setSize(size-16,size-31);icon.fill=fgui.LoaderFillType.Scale;icon.url=iconUrl(item);icon.touchable=false;
  label.setPosition(4,size-23);label.setSize(size-8,20);text(label,item.name);label.singleLine=true;format(label,size<90?12:13,'#e1ddcd');label.touchable=false;
  quantity.setPosition(4,size-45);quantity.setSize(size-12,22);text(quantity,item.quantity>1?String(item.quantity):'');quantity.textFormat.align='right';format(quantity,size<90?13:15,'#fff2c5');quantity.touchable=false;
  selected.setPosition(0,0);selected.setSize(size,size);selected.visible=JSON.parse(lastRaw).view.selectedId===item.id;selected.touchable=false;
  selected.element.drawRect(2,color('#f4c66a'),fgui.Color.CLEAR);
  if(!row.__complexWired){row.__complexWired=true;metrics.rowObjectsCreated++;row.onClick(()=>perform('select',{id:row.data}));}
}
function render(){
  if(!view)return;
  const response=JSON.parse(lastRaw),state=response.view;metrics.renders++;
  visible=state.visible;
  const list=child('list');list.numItems=visible.length;list.refreshVirtualList();
  text(child('coins'),`${state.coins.toLocaleString('en-US')} 金币`);
  text(child('summary'),`容量 ${state.usedSlots} / ${state.capacity} · 显示 ${visible.length} 件 · 已装备 ${Object.values(state.equipment).filter(Boolean).length} 件`);
  for(const category of Object.keys(categoryNames)){
    const button=child('tab_'+category);button.title=categoryNames[category];
    draw(button.getChild('btnbg'),1,category===state.category?'#c5a55f':'#53606b',category===state.category?'#344132':'#1a2835');
  }
  const selected=state.selected;
  child('detailIcon').fill=fgui.LoaderFillType.Scale;child('detailIcon').url=selected?iconUrl(selected):'';
  text(child('detailTitle'),selected?selected.name:'选择一件道具');
  text(child('rarity'),selected?`${rarityNames[selected.rarity]} · ${categoryNames[selected.type]}${selected.equipped?' · 已装备':''}`:'查看详情与属性');
  format(child('rarity'),0,selected?palette[selected.rarity]:'#a7b0b8');
  text(child('stats'),selected?selected.displayStats:'');text(child('description'),selected?selected.description:'点击左侧物品，查看装备、使用和出售操作。');
  const primary=child('primary'),sell=child('sell');
  primary.title=selected?.equipped?'卸下装备':selected?.type==='equipment'?'装备':selected?.type==='consumable'?'使用 ×1':'不可使用';
  enabled(primary,selected&&(selected.equipped||selected.type==='equipment'||selected.type==='consumable'));
  sell.title='出售 ×1';enabled(sell,selected&&!selected.equipped&&selected.type!=='quest');
  child('sort').title='排序·'+sortNames[state.sort];
  const search=child('search');if(search.text!==state.query)search.text=state.query;
  notice(noticeText,noticeError);
}
function applyLayout(){
  if(!view)return;
  layout=globalThis.complexLayout(stage.width,stage.height);view.setPosition(0,0);view.setSize(stage.width,stage.height);
  for(const item of layout.controls){
    const object=child(item.name);if(!object)throw new Error('Layout references absent source child: '+item.name);
    object.setPosition(item.x,item.y);object.setSize(item.width,item.height);object.visible=item.visible;
    if(object.getChild?.('btnbg'))buttonSize(object,item.width,item.height,item.fontSize);else format(object,item.fontSize);
  }
  const list=child('list');list.layout=fgui.ListLayoutType.FlowHorizontal;list.columnCount=layout.columns;list.autoResizeItem=false;list.lineGap=layout.gap;list.columnGap=layout.gap;
  if(list.virtualItemSize)list.virtualItemSize=new fgui.Vec2(layout.cellSize,layout.cellSize);
  render();
}
function open(){
  if(view)return;
  updateRaw('open');view=fgui.UIPackage.createObject('Inventory','ComplexMain');stage.addChild(view);mark(view,'inventory');
  for(const name of ['title','summary','notice','list','detailTitle','detailIcon','stats','description'])mark(child(name),name);
  const search=child('search'),input=search.element.htmlInput;input.dataset.testid='search';input.setAttribute('aria-label','搜索背包道具');
  let composing=false;
  const commitQuery=()=>{if(JSON.parse(lastRaw).view.query!==search.text)perform('query',{query:search.text});};
  const start=()=>{composing=true;metrics.compositionEvents.push('start');};
  const end=()=>{composing=false;metrics.compositionEvents.push('end');commitQuery();};
  input.addEventListener('compositionstart',start);input.addEventListener('compositionend',end);
  releaseInput=()=>{input.removeEventListener('compositionstart',start);input.removeEventListener('compositionend',end);};
  search.on('changed',()=>{if(!composing)commitQuery();});
  for(const category of Object.keys(categoryNames))bind(child('tab_'+category),'tab_'+category,()=>perform('category',{category}));
  bind(child('primary'),'primary',()=>{const item=JSON.parse(lastRaw).view.selected;if(item)perform(item.equipped?'unequip':item.type==='equipment'?'equip':'use',item.equipped?{slot:item.slot}:{id:item.id});});
  bind(child('sell'),'sell',sellSelected);bind(child('save'),'save',saveFile);bind(child('load'),'load',loadFile);bind(child('reward'),'reward',showRewards);
  bind(child('sort'),'sort',()=>{const modes=Object.keys(sortNames),current=JSON.parse(lastRaw).view.sort;perform('sort',{sort:modes[(modes.indexOf(current)+1)%modes.length]});});
  bind(child('close'),'close',close);
  const list=child('list');list.itemRenderer=renderRow;list.layout=fgui.ListLayoutType.FlowHorizontal;list.autoResizeItem=false;list.lineGap=8;list.columnGap=8;
  layout=globalThis.complexLayout(stage.width,stage.height);list.columnCount=layout.columns;
  list.setVirtual();list.virtualItemSize=new fgui.Vec2(layout.cellSize,layout.cellSize);list.scrollPane.mouseWheelEnabled=true;
  resize=()=>{applyLayout();if(popupMode==='rewards')showRewards();else closePopup();};window.addEventListener('resize',resize);applyLayout();
  view.getTransition('enter')?.play();metrics.opened++;document.getElementById('launch').style.display='none';
}
function close(){
  if(!view){updateRaw('close');return;}
  closePopup();releaseInput();releaseInput=()=>{};window.removeEventListener('resize',resize);resize=()=>{};
  view.dispose();view=null;updateRaw('close');metrics.closed++;document.getElementById('launch').style.display='block';
}
const rect=object=>{const r=object.element.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};};
function snapshot(){
  const list=child('list');
  return{ready:verification.ready,response:lastRaw?JSON.parse(lastRaw):null,rawTsResponse:lastRaw,
    ui:{open:!!view,popup:!!popup,screenWidth:stage.width,screenHeight:stage.height,virtualList:!!(list&&list._virtual),physicalRows:list?.numChildren||0,virtualItems:visible.length,scrollY:list?.scrollPane.posY||0,
      packageId:pkg?.id,mainResourceId:view?.packageItem?.id,title:child('title')?.text,columns:layout?.columns,cellSize:layout?.cellSize,
      controls:view?layout.controls.map(({name})=>{const object=child(name);return{name,rect:rect(object),enabled:object.touchable,visible:object.visible};}):[],
      rows:list?Array.from({length:list.numChildren},(_,index)=>{const row=list.getChildAt(index);return{id:row.data,rect:rect(row),label:row.getChild('label').text,quantity:row.getChild('quantity').text,iconUrl:row.getChild('icon').url};}):[]},
    metrics:{...metrics},errors:[...errors]};
}
const verification=globalThis.complexVerification={ready:false,metrics,errors,snapshot,
  async command(op,argsJson='{}'){
    let args;try{args=JSON.parse(argsJson);}catch{lastRaw=app.dispatch(op,argsJson);return snapshot();}
    if(!args||typeof args!=='object'||Array.isArray(args)){lastRaw=app.dispatch(op,argsJson);return snapshot();}
    try{
      switch(op){
        case 'open':open();break;case 'close':close();break;
        case 'confirm':{const action=pendingConfirm;closePopup();if(action)action();break;}
        case 'scroll':if(!view)throw new Error('Cannot scroll closed UI');child('list').scrollPane.posY=Number(args.y)||0;break;
        case 'popup':showRewards();break;case 'save-file':saveFile();break;case 'load-file':loadFile();break;
        default:perform(op,args);
      }
    }catch(error){runtimeError(error);}
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    return snapshot();
  }};
globalThis.verification=verification;
document.getElementById('launch').addEventListener('click',()=>{try{open();}catch(error){runtimeError(error);}});
try{
  if(!app || typeof app.dispatch!=='function')throw new Error('Shared complexInventoryApp IIFE is not loaded');
  lastRaw=app.snapshot();
  const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('FairyGUI package load exceeded 10s')),10000));
  pkg=await Promise.race([fgui.UIPackage.loadPackage('./assets/Inventory'),timeout]);
  const response=await fetch('./assets/Inventory/manifest.json');if(!response.ok)throw new Error('DOM loose image manifest is missing');manifest=await response.json();
  const images=manifest.packages?.[pkg.id]?.images;if(!images)throw new Error('Manifest does not contain the actual loaded package ID');
  const urls=[];
  for(const [id,file] of Object.entries(images)){
    const item=pkg.getItemById(id);if(!item)throw new Error('Manifest references absent package image '+id);
    const url=new URL('./assets/Inventory/'+file,location.href).href;item.file=url;urls.push(url);
  }
  await Promise.all(urls.map(async url=>{const image=new Image();image.src=url;await image.decode();}));
  await document.fonts.ready;open();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  verification.ready=true;
}catch(error){document.getElementById('failure').textContent=String(error);verification.failure=String(error);runtimeError(error);}
