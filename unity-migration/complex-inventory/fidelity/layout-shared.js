// Shared numeric presentation layout. Runs unchanged in browser and PuerTS; no DOM/CS/framework imports.
(function(global){
global.fidelityLayout=function(width,height,reference,manifest){
 const W=1586,H=992,stage={width,height},base='',fgui={LoaderFillType:{None:'none',Scale:'scale'}};
 function URL(file){this.href=file;}
 const controls=new Map(),artObjects=new Map();let gridColumns=6,gridBounds=reference.controls.list,cellWidth=128,cellHeight=137,progressMaximum=397.5;
 const rectOf=value=>Array.isArray(value)?{x:value[0],y:value[1],width:value[2],height:value[3]}:value;
 const node=name=>({name,x:0,y:0,width:0,height:0,fontSize:0,lineSpacing:5,singleLine:true,visible:true,element:{dataset:{}}});
 const control=name=>{if(!controls.has(name))controls.set(name,node(name));return Map.prototype.get.call(controls,name);};
 controls.get=control;
 function assign(object,r){Object.assign(object,rectOf(r));object.visible=true;}
 function moveControl(name,r,size,lineSpacing){const n=control(name);assign(n,r);if(size)n.fontSize=size;if(lineSpacing!==undefined)n.lineSpacing=lineSpacing;}
 function moveButton(name,r,size,labelRect){moveControl(name,r,size);const n=control(name);n.button=true;n.labelRect=labelRect||{x:0,y:0,width:r.width,height:r.height};}
 function moveArt(name,r,key=name,border=0,fill=false){const n=artObjects.get(name);if(!n)return;assign(n,r);n.skin=key;n.border=border;n.fillCenter=fill;}
 function centerAction(){} // Native text measurement belongs to each platform adapter.
 for(const [key,asset] of Object.entries(manifest.assets)){const n=node(key);n.asset=key;n.visible=false;Object.assign(n,rectOf(asset.sourceRect));artObjects.set(key,n);}
 for(const key of ['left-background-base','detail-background-base','footer-background-base']){const n=node(key);n.visible=false;n.graph=true;artObjects.set(key,n);}
 for(const [name,r] of Object.entries(reference.controls)){moveControl(name,r);}
 for(const name of ['title','itemNote','stats-background-mask','capacity-fill','footer',...['attack','crit','durability'].flatMap(k=>['stat-label-'+k,'stat_'+k])])control(name);
 controls.get('description').singleLine=false;controls.get('itemNote').singleLine=false;
function applyNarrow(){
  const width=stage.width,height=stage.height,leftWidth=Math.floor(width*.36),rightX=leftWidth+24,rightWidth=width-rightX-12,panelY=170,panelHeight=height-235;
  const left={x:12,y:panelY,width:leftWidth,height:panelHeight},right={x:rightX,y:panelY,width:rightWidth,height:panelHeight},footer={x:12,y:height-51,width:width-24,height:39};
  for(const object of artObjects.values())object.visible=false;
  moveArt('environmentLeft',{x:0,y:0,width:height*127/992,height});moveArt('environmentRight',{x:width-height*133/992,y:0,width:height*133/992,height});
  moveArt('left-background-base',left);moveArt('detail-background-base',right);moveArt('footer-background-base',footer);
  moveArt('frameLeft',left,'frameLeft',12);moveArt('frameRight',right,'frameRight',12);moveArt('frameFooter',footer,'frameFooter',10);
  moveControl('title',{x:12,y:8,width:Math.min(260,width-210),height:61});controls.get('title').fill=fgui.LoaderFillType.Scale;
  moveArt('coin',{x:width-185,y:18,width:28,height:28});moveControl('coins',{x:width-149,y:16,width:104,height:32},22);
  if(manifest.assets.coinAlpha){const coin=artObjects.get('coin'),asset=manifest.assets.coinAlpha;coin.url=new URL(asset.file,base).href;coin.sourceWidth=asset.width;coin.sourceHeight=asset.height;coin.fill=fgui.LoaderFillType.None;coin.fill=fgui.LoaderFillType.Scale;coin.align='center';coin.verticalAlign='middle';coin.element.dataset.skinAsset='coinAlpha';}
  moveButton('close',{x:width-38,y:17,width:26,height:26},20);
  moveArt('searchBg',{x:12,y:84,width:width-24,height:34},'searchBg',8,true);moveArt('searchIcon',{x:22,y:91,width:20,height:20});moveControl('search',{x:50,y:87,width:width-70,height:28},16);
  const tabWidth=(width-48)/5;for(const [index,category] of ['all','equipment','consumable','material','quest'].entries())moveButton('tab_'+category,{x:12+index*(tabWidth+6),y:124,width:tabWidth,height:34},16);
  gridBounds={x:24,y:184,width:leftWidth-24,height:panelHeight-28};
  const candidates=[2,3,4].map(columns=>{const lines=Math.ceil(24/columns);return{columns,cell:Math.min((gridBounds.width-8*(columns-1))/columns,(gridBounds.height-8*(lines-1))/lines*128/137)};}).sort((a,b)=>b.cell-a.cell);
  gridColumns=candidates[0].columns;cellWidth=candidates[0].cell;cellHeight=cellWidth*137/128;
  const gridWidth=cellWidth*gridColumns+8*(gridColumns-1);gridBounds.x+=(gridBounds.width-gridWidth)/2;gridBounds.width=gridWidth;moveControl('list',gridBounds);
  const iconWidth=Math.min(110,rightWidth*.4),iconHeight=iconWidth*392/194,iconY=panelY+18,infoX=rightX+iconWidth+20,infoWidth=rightWidth-iconWidth-32,statsY=panelY+140;
  moveControl('detailIcon',{x:rightX+12,y:iconY,width:iconWidth,height:iconHeight});
  controls.get('detailTitle').singleLine=false;controls.get('rarity').singleLine=false;
  moveControl('detailTitle',{x:infoX,y:panelY+16,width:infoWidth,height:48},rightWidth<240?18:20,4);
  moveControl('rarity',{x:infoX,y:panelY+70,width:infoWidth,height:64},16,4);
  moveControl('stats-background-mask',{x:infoX-3,y:statsY-4,width:infoWidth+6,height:104});
  for(const [index,key] of ['attack','crit','durability'].entries()){
    moveControl('stat-label-'+key,{x:infoX+20,y:statsY+index*32,width:36,height:28},16);
    moveControl('stat_'+key,{x:infoX+56,y:statsY+index*32,width:infoWidth-56,height:28},18);
  }
  for(const [index,key] of ['statAttack','statCrit','statDurability'].entries())moveArt(key,{x:infoX,y:statsY+index*32+6,width:16,height:16});
  moveControl('itemNote',{x:infoX,y:statsY,width:infoWidth,height:100},16,6);
  const actionWidth=rightWidth-24,primaryHeight=actionWidth*manifest.assets.primaryBg.height/manifest.assets.primaryBg.width,sellHeight=actionWidth*manifest.assets.secondaryBg.height/manifest.assets.secondaryBg.width;
  const sellY=panelY+panelHeight-16-sellHeight,primaryY=sellY-12-primaryHeight,descriptionY=Math.max(iconY+iconHeight,statsY+92)+14;
  moveControl('description',{x:rightX+16,y:descriptionY,width:rightWidth-32,height:Math.min(160,primaryY-descriptionY-12)},16,8);
  const primaryRect={x:rightX+12,y:primaryY,width:actionWidth,height:primaryHeight},sellRect={x:rightX+12,y:sellY,width:actionWidth,height:sellHeight};
  moveButton('primary',primaryRect,Math.min(28,Math.max(16,primaryHeight*28/64)));moveButton('sell',sellRect,Math.min(28,Math.max(16,sellHeight*29/62)));
  centerAction('primary','compass',primaryRect);centerAction('sell','sellCoins',sellRect);
  moveArt('capacityIcon',{x:26,y:footer.y+3,width:20,height:22});moveControl('summary',{x:54,y:footer.y+1,width:86,height:26},18);
  moveArt('progressFrame',{x:26,y:footer.y+27,width:118,height:10},'progressFrame',4);moveControl('capacity-fill',{x:30,y:footer.y+31,width:110,height:2});progressMaximum=110;
  moveButton('sort',{x:width-216,y:footer.y+2,width:164,height:35},18);moveArt('sortArrow',{x:width-78,y:footer.y+14,width:16,height:12});moveButton('menu',{x:width-46,y:footer.y+3,width:30,height:32},20);
  controls.get('footer').visible=false;
}
function applyAdaptive(){
  if(stage.width<700){applyNarrow();return;}
  const width=stage.width,height=stage.height,leftWidth=Math.floor((width-54)/2),rightX=leftWidth+24,rightWidth=width-rightX-12,panelHeight=Math.max(420,height-195),panelY=130;
  const left={x:12,y:panelY,width:leftWidth,height:panelHeight},right={x:rightX,y:panelY,width:rightWidth,height:panelHeight},footer={x:12,y:height-51,width:width-24,height:39};
  for(const object of artObjects.values())object.visible=false;
  moveArt('environmentLeft',{x:0,y:0,width:height*127/992,height});moveArt('environmentRight',{x:width-height*133/992,y:0,width:height*133/992,height});
  // Canonical masked backgrounds contain fixed semantic holes. Reflow uses blank bases and frame-only nine-slices.
  moveArt('left-background-base',left);moveArt('detail-background-base',right);moveArt('footer-background-base',footer);
  moveArt('frameLeft',left,'frameLeft',12);moveArt('frameRight',right,'frameRight',12);moveArt('frameFooter',footer,'frameFooter',10);
  moveControl('title',{x:12,y:8,width:260,height:61});controls.get('title').fill=fgui.LoaderFillType.Scale;
  moveArt('coin',{x:width-185,y:18,width:28,height:28});moveControl('coins',{x:width-149,y:16,width:104,height:32},22);
  if(manifest.assets.coinAlpha){const coin=artObjects.get('coin'),asset=manifest.assets.coinAlpha;coin.url=new URL(asset.file,base).href;coin.sourceWidth=asset.width;coin.sourceHeight=asset.height;coin.fill=fgui.LoaderFillType.None;coin.fill=fgui.LoaderFillType.Scale;coin.align='center';coin.verticalAlign='middle';coin.element.dataset.skinAsset='coinAlpha';}
  moveButton('close',{x:width-38,y:17,width:26,height:26},20);
  const searchWidth=230,tabWidth=(width-24-searchWidth-10-24)/5;
  moveArt('searchBg',{x:12,y:84,width:searchWidth,height:34},'searchBg',8,true);moveArt('searchIcon',{x:22,y:91,width:20,height:20});
  moveControl('search',{x:50,y:87,width:182,height:28},16);
  for(const [index,category] of ['all','equipment','consumable','material','quest'].entries())moveButton('tab_'+category,{x:252+index*(tabWidth+6),y:84,width:tabWidth,height:34},16);
  gridColumns=4;gridBounds={x:24,y:144,width:leftWidth-24,height:panelHeight-24};
  cellWidth=Math.min((gridBounds.width-24)/4,(gridBounds.height-40)/6*128/137);cellHeight=cellWidth*137/128;
  moveControl('list',gridBounds);
  moveControl('detailIcon',{x:rightX+14,y:150,width:132,height:260});
  controls.get('detailTitle').singleLine=true;controls.get('rarity').singleLine=true;
  moveControl('detailTitle',{x:rightX+160,y:153,width:rightWidth-174,height:38},24,5);
  moveControl('rarity',{x:rightX+160,y:196,width:rightWidth-174,height:40},16,5);
  moveControl('stats-background-mask',{x:rightX+148,y:242,width:rightWidth-160,height:158});
  for(const [index,key] of ['attack','crit','durability'].entries()){
    moveControl('stat-label-'+key,{x:rightX+185,y:247+index*43,width:80,height:31},17);
    moveControl('stat_'+key,{x:rightX+rightWidth-88,y:247+index*43,width:72,height:31},21);
  }
  for(const [index,key] of ['statAttack','statCrit','statDurability'].entries())moveArt(key,{x:rightX+151,y:250+index*43,width:25,height:25});
  moveControl('itemNote',{x:rightX+160,y:252,width:rightWidth-174,height:136},17,9);
  moveControl('description',{x:rightX+16,y:420,width:rightWidth-32,height:84},16,9);
  const actionWidth=rightWidth-24,primaryHeight=actionWidth*manifest.assets.primaryBg.height/manifest.assets.primaryBg.width,sellHeight=actionWidth*manifest.assets.secondaryBg.height/manifest.assets.secondaryBg.width;
  const sellY=panelY+panelHeight-16-sellHeight,primaryY=sellY-12-primaryHeight;
  const primaryRect={x:rightX+12,y:primaryY,width:actionWidth,height:primaryHeight},sellRect={x:rightX+12,y:sellY,width:actionWidth,height:sellHeight};
  moveButton('primary',primaryRect,Math.min(28,Math.max(23,primaryHeight*28/64)));moveButton('sell',sellRect,Math.min(28,Math.max(23,sellHeight*29/62)));
  centerAction('primary','compass',primaryRect);centerAction('sell','sellCoins',sellRect);
  moveArt('capacityIcon',{x:26,y:footer.y+7,width:24,height:25});moveControl('summary',{x:60,y:footer.y+5,width:78,height:29},19);
  const progressWidth=Math.max(120,leftWidth-138);
  moveArt('progressFrame',{x:140,y:footer.y+12,width:progressWidth,height:15},'progressFrame',6);
  moveControl('capacity-fill',{x:144,y:footer.y+16,width:progressWidth-8,height:7});progressMaximum=progressWidth-8;
  moveButton('sort',{x:width-250,y:footer.y+2,width:190,height:35},19);
  moveArt('sortArrow',{x:width-86,y:footer.y+14,width:16,height:12});moveButton('menu',{x:width-46,y:footer.y+3,width:30,height:32},20);
  controls.get('footer').visible=false;
}

 const mode=width>=1100&&Math.abs(width/height-W/H)<.08?'canonical':'adaptive';
 if(mode==='adaptive')applyAdaptive();
 else{
   for(const key of ['environmentLeft','environmentRight','environmentTop','environmentBottom','headerLeftMiddle','headerRightLower','headerRightUpper','headerCoinBlank','leftBackground','detailBackground','footerBackground','frameLeft','frameRight','frameFooter','coin','searchBg','searchIcon','compass','sellCoins','statAttack','statCrit','statDurability','detailDivider','detailLowerDivider','capacityIcon','progressFrame','sortArrow']){const a=artObjects.get(key);if(a)a.visible=true;}
   if(manifest.assets.headerCoinBlank)moveArt('headerCoinBlank',manifest.assets.headerCoinBlank.intendedFillRect||{x:1113,y:17,width:183,height:45});
   moveArt('left-background-base',reference.panels.left);moveArt('detail-background-base',reference.panels.right);moveArt('footer-background-base',reference.panels.footer);
   moveControl('title',reference.controls.headerBranding);moveControl('search',reference.controls.searchText,23);moveControl('coins',reference.controls.coins,32);
   moveControl('detailTitle',reference.controls.detailTitle,31);moveControl('rarity',reference.controls.rarity,24);moveControl('description',{...reference.controls.description,x:1046,y:563,height:90},19,10);
   moveControl('itemNote',{x:1238,y:348,width:180,height:145},21,10);moveControl('stats-background-mask',{x:1230,y:330,width:194,height:183});
   for(let i=0;i<3;i++){const key=['attack','crit','durability'][i],s=reference.detail.stats[i];moveControl('stat-label-'+key,s.labelRect,25);moveControl('stat_'+key,{...s.valueRect,x:s.valueRect.x-18,width:75},29);}
   moveControl('summary',reference.controls.summary,29);moveControl('capacity-fill',{x:299,y:901,width:318,height:14});
   for(const key of ['all','equipment','consumable','material','quest'])moveButton('tab_'+key,reference.controls['tab_'+key],23);
   moveButton('primary',reference.controls.primary,28,{x:reference.controls.primaryText.x-reference.controls.primary.x,y:reference.controls.primaryText.y-reference.controls.primary.y,width:reference.controls.primaryText.width,height:reference.controls.primaryText.height});
   moveButton('sell',reference.controls.sell,29,{x:158,y:0,width:116,height:62});moveButton('sort',reference.controls.sort,27,{x:8,y:0,width:134,height:49});moveButton('close',reference.controls.close,20);moveButton('menu',reference.controls.menu,34);
   moveControl('footer',reference.controls.footerHint,18);
 }
 const scale=mode==='adaptive'?1:Math.min(width/W,height/H),offsetX=mode==='adaptive'?0:(width-W*scale)/2,offsetY=mode==='adaptive'?0:(height-H*scale)/2;
 const project=n=>{const out={};for(const key of ['name','asset','graph','x','y','width','height','visible','fontSize','lineSpacing','singleLine','button','labelRect','skin','border','fillCenter','fill','align','verticalAlign','sourceWidth','sourceHeight','url'])if(n[key]!==undefined)out[key]=n[key];if(n.element.dataset.skinAsset)out.asset=n.element.dataset.skinAsset;return out;};
 const slots=Array.from({length:24},(_,i)=>mode==='canonical'?rectOf(reference.slots[i].rect):{x:gridBounds.x+(i%gridColumns)*(cellWidth+8),y:gridBounds.y+Math.floor(i/gridColumns)*(cellHeight+8),width:cellWidth,height:cellHeight});
 return{schemaVersion:1,width,height,mode,variant:mode==='canonical'?'reference':width<700?'narrow':'split',scale,offsetX,offsetY,designWidth:mode==='canonical'?W:width,designHeight:mode==='canonical'?H:height,columns:gridColumns,gap:8,cellWidth,cellHeight,gridBounds,progressMaximum,quantityFontSize:mode==='canonical'?24:width<700?16:18,controls:[...controls.values()].map(project),art:[...artObjects.values()].map(project),slots};
};
// Presentation strings only. Business mutations remain in the unchanged app bundle.
global.fidelityPresentation=function(view,variant){
 view=view||{};const selected=view.selected||null;
 const rarityNames={common:'普通',uncommon:'优秀',rare:'稀有',epic:'史诗',legendary:'传说'},typeNames={equipment:'装备',consumable:'消耗品',material:'材料',quest:'任务物品'};
 const rarityName=selected?rarityNames[selected.rarity]:'',typeName=selected?(selected.slot==='weapon'?'武器':typeNames[selected.type]):'';
 const labels={attack:'攻击',crit:'暴击',durability:'耐久',defense:'防御',health:'生命',mana:'法力',stamina:'耐力'};
 const stats=Object.entries(selected?.stats||{}).slice(0,3).map(([key,value])=>({key,label:labels[key]||key,value:key==='durability'?String(value):`+${value}${key==='crit'?'%':''}`}));
 return {title:'旅者背包',coins:String(view.coins??0).replace(/\B(?=(\d{3})+(?!\d))/g,','),summary:`${view.usedSlots??0} / ${view.capacity??0}`,
  detailTitle:selected?.name||'选择一件道具',rarity:selected?(variant==='narrow'?[rarityName,typeName,selected.equipped?'已装备':null].filter(Boolean).join('\n'):`${rarityName} · ${typeName}${selected.equipped?' · 已装备':''}`):'',
  description:selected?.description||'点击道具查看详情',note:selected&&!stats.length?(selected.type==='quest'?'任务物品\n不可使用 · 不可交易':selected.type==='material'?'制作材料\n可出售 · 不可直接使用':'此道具没有额外属性'):'',stats,
  primaryText:selected?.equipped?'卸下':selected?.type==='equipment'?'装备':selected?.type==='consumable'?'使用':'不可使用',sellText:selected?.type==='quest'?'不可交易':'出售',
  primaryEnabled:!!(selected&&(selected.equipped||selected.type==='equipment'||selected.type==='consumable')),sellEnabled:!!(selected&&!selected.equipped&&selected.type!=='quest'),
  selectedSword:selected?.kind==='sword',selectedIconIndex:selected?.iconIndex??null,selectedId:selected?.id??null};
};})(globalThis);
