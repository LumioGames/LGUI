// Shared, platform-free geometry. Browser and PuerTS execute these exact bytes.
globalThis.complexLayout=function(width,height){
 const narrow=width<700, controls=[];
 const add=(name,x,y,w,h,fontSize=0)=>controls.push({name,x,y,width:w,height:h,fontSize,visible:true});
 add('backdrop',0,0,width,height);
 let cellSize,columns;
 if(narrow){
  const pad=12,w=width-24;columns=4;cellSize=Math.floor((w-24)/4);
  const gridY=166,gridH=Math.max(170,height-558),detailY=gridY+gridH+12,detailH=208;
  add('panel',pad,76,w,height-88);
  add('title',16,16,width-142,34,26);add('subtitle',18,53,width-36,18,10);
  add('coins',width-140,20,92,28,16);add('close',width-44,16,30,32);
  add('searchbg',pad,83,w,36);add('search',pad+10,88,w-20,26,16);
  ['all','equipment','consumable','material','quest'].forEach((n,i)=>add('tab_'+n,pad+i*(w+4)/5,128,(w-16)/5,30,13));
  add('list',pad,gridY,w,gridH);
  add('detailbg',pad,detailY,w,detailH);
  add('detailIcon',pad+12,detailY+12,76,76);
  add('detailTitle',pad+100,detailY+13,w-112,28,22);
  add('rarity',pad+100,detailY+45,w-112,22,14);
  add('stats',pad+100,detailY+70,w-112,28,13);
  add('description',pad+12,detailY+106,w-24,42,13);
  add('primary',pad+12,detailY+160,(w-32)/2,36,17);
  add('sell',pad+20+(w-32)/2,detailY+160,(w-32)/2,36,17);
  const summaryY=detailY+detailH+10,buttonsY=summaryY+28;
  add('summary',pad+2,summaryY,w-4,24,13);
  ['sort','save','load','reward'].forEach((n,i)=>add(n,pad+i*(w+6)/4,buttonsY,(w-18)/4,34,13));
  add('notice',pad,buttonsY+42,w,28,12);
 }else{
  const w=Math.min(1360,width-48),left=(width-w)/2,top=Math.max(8,(height-Math.min(880,height-24))/2),h=Math.min(880,height-24);
  const gx=left+18,gy=top+154,gw=Math.floor(w*0.64)-28,dx=gx+gw+18,dw=left+w-18-dx;
  columns=6;cellSize=Math.floor((gw-40)/6);
  add('panel',left,top+88,w,h-88);
  add('title',left+16,top+6,650,48,40);add('subtitle',left+18,top+58,650,20,13);
  add('coins',left+w-246,top+15,184,36,25);add('close',left+w-48,top+12,36,36);
  add('searchbg',gx,top+102,Math.floor(gw*.38),38);add('search',gx+10,top+108,Math.floor(gw*.38)-20,28,16);
  const tabsX=gx+Math.floor(gw*.38)+12,tw=(gw-(tabsX-gx)-32)/5;
  ['all','equipment','consumable','material','quest'].forEach((n,i)=>add('tab_'+n,tabsX+i*(tw+8),top+102,tw,38,16));
  add('list',gx,gy,gw,h-242);
  add('detailbg',dx,top+102,dw,h-190);
  const icon=Math.min(220,dw-32);
  add('detailIcon',dx+(dw-icon)/2,top+121,icon,icon);
  const textY=top+136+icon;
  add('detailTitle',dx+20,textY,dw-40,36,29);add('rarity',dx+20,textY+42,dw-40,25,17);
  add('stats',dx+20,textY+80,dw-40,56,19);
  add('description',dx+20,textY+145,dw-40,72,16);
  add('primary',dx+20,top+h-192,dw-40,44,22);add('sell',dx+20,top+h-138,dw-40,42,20);
  add('summary',gx,top+h-74,gw,26,16);
  const by=top+h-38,bw=94;
  ['sort','save','load','reward'].forEach((n,i)=>add(n,dx+i*(dw+6)/4,by,(dw-18)/4,32,14));
  add('notice',gx,by,gw,32,14);
 }
 return {width,height,narrow,columns,cellSize,gap:8,controls};
};
