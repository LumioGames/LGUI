import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Document, AlignType, AutoSizeType, GraphType, OverflowType, ScrollBarDisplayType, GearType, TransitionActionType, composeController, composeTransition, bindLookGear, liftDocumentToUamProject, writeProjectFromUam } from '@openfairygui/core';
import { NodeIO } from '@openfairygui/core/node';
import { publishNode, validateProjectNode } from '@openfairygui/functions/node';
import sharp from 'sharp';

export const root = path.dirname(fileURLToPath(import.meta.url));
export const projectPath = path.join(root, 'project', 'Inventory.fairy');
export const ids = { package:'invtest1', Main:'main0001', ItemRow:'itemrow1', Reward:'reward01', Btn:'button01', icon:'icon0001' };

export async function createProject() {
  const d = new Document();
  d.getRoot().setProjectId('inventory-verification').setVersion('3.0').setProjectType(4).setSettings({publish:{binaryFormat:true,compressDesc:false,fileExtension:'fui'},common:{},adaptation:{}});
  const p = d.createPackage('Inventory').setId(ids.package);
  const component = (name,w,h) => { const c=d.createComponent(name).setId(ids[name]).setPath('/').setExported(true).setSize(w,h).setOpaque(true);p.addResource(c);return c; };
  const bg=(c,id,x,y,w,h,color)=>c.addChild(d.createGGraph(id).setId(id).setXY(x,y).setSize(w,h).setGraphType(GraphType.Rect).setFillColor(color).setLineSize(0).setTouchable(false));
  const text=(c,id,value,x,y,w,h,size=20,color='#DCE9FF')=>{const n=d.createGTextField(id).setId(id).setText(value).setXY(x,y).setSize(w,h).setFontSize(size).setColor(color).setAutoSize(AutoSizeType.None).setTouchable(false);c.addChild(n);return n;};
  const btn=component('Btn',132,40).setExtensionType('Button');
  bg(btn,'btnbg',0,0,132,40,'#2868A6');
  text(btn,'title','操作',0,6,132,28,18,'#FFFFFF').setAlign(AlignType.Center);
  const button=(c,id,value,x,y,w=132)=>{const n=d.createGComponent(id).setId(id).setSrc(ids.Btn).setXY(x,y).setSize(w,40).setInstanceExtType('Button').setInstanceTitle(value);c.addChild(n);return n;};
  const row=component('ItemRow',820,72);
  bg(row,'rowbg',0,0,820,72,'#14283E');
  row.addChild(d.createGImage('icon').setId('icon').setSrc(ids.icon).setXY(12,12).setSize(48,48).setTouchable(false));
  text(row,'label','道具',78,10,430,26,20);
  const status=text(row,'status','未达成',78,39,430,22,15,'#A6B7CA');
  const claim=button(row,'claim','未达成',670,16);
  const state=composeController(d,row,{name:'state',pages:[{id:'locked',name:'locked'},{id:'ready',name:'ready'},{id:'claimed',name:'claimed'}],selectedIndex:0,exported:true});
  for(const node of [status,claim]) node.addGear(d.createGear().setGearType(GearType.Text).setController(state).setPages('locked,ready,claimed').setDefaultValue('未达成').setPageValues({locked:'未达成',ready:'可领取',claimed:'已领取'}));
  bindLookGear(d,row,claim,{controller:state,defaultValue:{alpha:1,rotation:0,grayed:true,touchable:false},states:[{pageId:'locked',value:{alpha:1,rotation:0,grayed:true,touchable:false}},{pageId:'ready',value:{alpha:1,rotation:0,grayed:false,touchable:true}},{pageId:'claimed',value:{alpha:1,rotation:0,grayed:true,touchable:false}}]});
  const main=component('Main',900,650);
  bg(main,'background',0,0,900,650,'#0B1626');
  text(main,'title','旅者背包',30,24,640,42,30);
  main.addChild(d.createGTextInput('search').setId('search').setText('').setPromptText('搜索道具，支持中文').setXY(32,89).setSize(500,40).setFontSize(20).setColor('#FFFFFF').setAutoSize(AutoSizeType.None).setSingleLine(true));
  bg(main,'searchbg',28,83,510,48,'#1A304A');
  // Input is last among these overlapping nodes so its event target remains reachable.
  const input=main.getChildById('search'); main.removeChild(input); main.addChild(input);
  button(main,'update','推进任务',554,88);button(main,'reward','奖励说明',704,88);button(main,'close','关闭',738,24);
  main.addChild(d.createGList('list').setId('list').setXY(32,154).setSize(836,412).setDefaultItem(`ui://${ids.package}${ids.ItemRow}`).setOverflow(OverflowType.Scroll).setScrollBarDisplay(ScrollBarDisplayType.Hidden).setLineGap(8).setAutoResizeItem(true));
  text(main,'summary','0 个道具 · 未达成 / 可领取 / 已领取',32,588,836,32,18,'#98B8D8');
  composeTransition(d,main,{name:'enter',autoPlay:false,fps:30,items:[{time:0,actionType:TransitionActionType.Alpha,tween:true,duration:9,startValue:[0],endValue:[1],label:'fade'}]});
  const reward=component('Reward',480,300);
  bg(reward,'rewardbg',0,0,480,300,'#18334C');
  text(reward,'title','奖励已领取',24,24,432,40,28);
  text(reward,'body','你的物品已放入背包。\n这是一段用于验证换行和长文本显示的说明。',24,84,432,116,20);
  button(reward,'confirm','确认',174,232);
  const img=await sharp({create:{width:32,height:32,channels:4,background:{r:245,g:185,b:64,alpha:1}}}).png().toBuffer();
  p.addResource(d.createImageResource('icon').setId(ids.icon).setPath('/').setFileName('icon.png').setWidth(32).setHeight(32).setExported(true));
  const uam=liftDocumentToUamProject(d);uam.packages[0].resources.find(x=>x.id===ids.icon).sourceBytes=new Uint8Array(img);
  await mkdir(path.dirname(projectPath),{recursive:true});await writeProjectFromUam(new NodeIO(),uam,projectPath);
  await writeFile(path.join(root,'identity.json'),JSON.stringify({projectPath,ids},null,2));
  return projectPath;
}

export async function publishAll(){
 const validation=await validateProjectNode(projectPath);
 if(validation.status!=='valid'||!validation.complete) throw new Error(JSON.stringify(validation));
 const reports={validation};
 for(const [name,type,ext] of [['layabox',4,'fui'],['unity',0,'bytes']]){
   const document=await new NodeIO().readProject(projectPath);document.getRoot().setProjectType(type);
   reports[name]=await publishNode({document,output:path.join(root,'published',name),compressed:false,fileExtension:ext,plugins:[],codeGeneration:false});
 }
 await writeFile(path.join(root,'publish-result.json'),JSON.stringify(reports,null,2)); return reports;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) { await createProject();console.log(JSON.stringify(await publishAll(),null,2)); }
