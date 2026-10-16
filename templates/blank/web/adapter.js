import * as fgui from './vendor/fairygui.module.js';
const app=globalThis.uiApp,root=fgui.GRoot.inst,title=new fgui.GTextField();
title.autoSize=fgui.AutoSizeType.None;title.singleLine=false;title.touchable=false;
Object.assign(title.textFormat,{font:'Arial',size:24,color:0xe5edf0});title.applyFormat();
title.element.dataset.testid='ui-title';root.addChild(title);
function render(){root.setSize(innerWidth,innerHeight);title.setPosition(24,24);title.setSize(Math.max(1,innerWidth-48),80);title.text=app.snapshot().title;}
window.addEventListener('resize',render);render();
window.addEventListener('pagehide',()=>{window.removeEventListener('resize',render);title.dispose();},{once:true});
