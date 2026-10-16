// Platform boundary. This is the only application module that imports FairyGUI DOM.
import * as fgui from './vendor/fairygui.module.js';
import { Inventory } from './shared/model.js';

const count = Math.min(10000, Math.max(3, Number(new URL(location.href).searchParams.get('count') || 30)));
const store = new Inventory(count);
const metrics = { opened: 0, closed: 0, callbacks: 0, renders: []            , lastClaimMs: 0, dragEnds: 0, closedCallbacks: 0, compositionEvents: []            , scrollLatencyMs: []             };
const stage = fgui.GRoot.inst;
let view     , popup     , shade     , release = () => {}, resize = () => {};
let visible                                               = [];
let exitPopup = () => {};
const mark = (obj     , name        , role         ) => {
  obj.element.dataset.testid = name;
  if (role) { obj.element.setAttribute('role', role); obj.element.setAttribute('aria-label', obj.title || name); }
};
const button = (obj     , name        , action            ) => { mark(obj, name, 'button'); obj.onClick(action); };
const arrangeButton = (obj     , x        , y        , w = 132) => {
  obj.setPosition(x, y); obj.setSize(w, 40);
  obj.getChild('btnbg')?.setSize(w, 40);
  obj.getChild('title')?.setSize(w, 28);
};

function showReward(message        , title = '奖励已领取') {
  exitPopup();
  shade = new fgui.GGraph(); shade.setSize(stage.width, stage.height);
  shade.element.drawRect(0, fgui.Color.CLEAR, new fgui.Color(0, 0, 0, 0.65));
  stage.addChild(shade);
  popup = fgui.UIPackage.createObject('Inventory', 'Reward');
  stage.addChild(popup);
  const w = Math.min(480, stage.width - 24);
  popup.setSize(w, 330); popup.setPosition((stage.width - w) / 2, (stage.height - 330) / 2);
  popup.getChild('rewardbg').setSize(w, 330);
  popup.getChild('title').text = title; popup.getChild('title').setSize(w - 48, 40);
  popup.getChild('body').text = message; popup.getChild('body').setSize(w - 48, 174);
  popup.getChild('body').textFormat.size = stage.width < 500 ? 17 : 20;
  popup.getChild('body').applyFormat();
  arrangeButton(popup.getChild('confirm'), (w - 132) / 2, 270);
  mark(popup, 'popup');
  popup.draggable = true;
  popup.on('drag_end', () => metrics.dragEnds++);
  exitPopup = () => { if (popup) { popup.dispose(); popup = null; } if (shade) { shade.dispose(); shade = null; } exitPopup = () => {}; };
  button(popup.getChild('confirm'), 'confirm', exitPopup);
}

function open() {
  if (view) return;
  const begin = performance.now();
  view = fgui.UIPackage.createObject('Inventory', 'Main');
  if (!view) throw new Error('Missing Inventory/Main');
  stage.addChild(view); mark(view, 'inventory');
  const title = view.getChild('title'), search = view.getChild('search'), list = view.getChild('list');
  mark(title, 'title'); mark(list, 'list'); mark(view.getChild('summary'), 'summary');
  search.element.htmlInput.setAttribute('aria-label', '搜索道具');
  search.element.htmlInput.dataset.testid = 'search';
  search.text = store.snapshot().query;
  let composing = false;
  search.element.htmlInput.addEventListener('compositionstart', () => { composing = true; metrics.compositionEvents.push('start'); });
  search.element.htmlInput.addEventListener('compositionend', () => { composing = false; metrics.compositionEvents.push('end'); store.setQuery(search.text); });
  search.on('changed', () => { if (!composing) store.setQuery(search.text); });
  button(view.getChild('update'), 'update', () => store.progress());
  button(view.getChild('reward'), 'reward', () => showReward('未达成：先推进任务。可领取：点击领取获得 10 金币。已领取：不会重复发奖。\n拖拽弹窗空白区域可移动；搜索支持中文。', '奖励说明'));
  button(view.getChild('close'), 'close', close);
  list.itemRenderer = (index        , row     ) => {
    const item = visible[index]; if (!item) return;
    row.data = item.id; row.element.dataset.itemId = item.id; mark(row, 'row');
    row.getChild('label').text = item.name;
    row.getController('state').selectedPage = item.state;
    const action = row.getChild('claim');
    // Enforce eligibility in both the model and platform UI. Controller artwork is independent.
    action.touchable = item.state === 'ready'; action.grayed = item.state !== 'ready';
    action.element.setAttribute('aria-disabled', String(item.state !== 'ready'));
    if (!row.__wired) {
      row.__wired = true;
      button(action, 'claim', () => {
        const start = performance.now(); const result = store.claim(row.data);
        if (result.ok) showReward(result.message );
        requestAnimationFrame(() => { metrics.lastClaimMs = performance.now() - start; });
      });
    }
    const width = list.width;
    row.setSize(width, 72); row.getChild('rowbg').setSize(width, 72);
    row.getChild('label').setSize(Math.max(80, width - 228), 26);
    row.getChild('label').textFormat.size = width < 500 ? 16 : 20;
    row.getChild('label').singleLine = true;
    row.getChild('label').applyFormat();
    row.getChild('status').setSize(Math.max(80, width - 228), 22);
    arrangeButton(action, width - 142, 16);
  };
  list.setVirtual();
  // Legacy runtime disables wheel input when scrollbars are hidden (ScrollPane.ts:221).
  list.scrollPane.mouseWheelEnabled = true;
  let wheelAt                    ;
  list.element.addEventListener('wheel', () => { wheelAt = performance.now(); }, { capture: true });
  list.on('scroll', () => { if (wheelAt !== undefined) { metrics.scrollLatencyMs.push(performance.now() - wheelAt); wheelAt = undefined; } });
  const render = () => {
    if (!view) { metrics.closedCallbacks++; return; }
    const started = performance.now(), state = store.snapshot();
    visible = state.visible;
    list.numItems = visible.length; list.refreshVirtualList();
    view.getChild('summary').text = `${state.visible.length} / ${count} 个道具 · 金币 ${state.coins} · 未达成 / 可领取 / 已领取`;
    metrics.renders.push(performance.now() - started); metrics.callbacks++;
  };
  resize = () => {
    if (!view) return;
    const w = Math.min(900, stage.width - 16), h = Math.min(690, stage.height - 16), narrow = w < 600;
    view.setSize(w, h); view.setPosition((stage.width - w) / 2, 8);
    view.getChild('background').setSize(w, h);
    title.setPosition(20, 20); title.setSize(w - 150, 40); title.textFormat.size = narrow ? 16 : 30; title.applyFormat();
    arrangeButton(view.getChild('close'), w - 116, 22, 96);
    const searchWidth = narrow ? w - 40 : w - 340;
    search.setPosition(24, 91); search.setSize(searchWidth - 8, 36);
    view.getChild('searchbg').setPosition(20, 85); view.getChild('searchbg').setSize(searchWidth, 48);
    arrangeButton(view.getChild('update'), narrow ? 20 : w - 298, narrow ? 144 : 89);
    arrangeButton(view.getChild('reward'), narrow ? w - 152 : w - 152, narrow ? 144 : 89);
    list.setPosition(20, narrow ? 204 : 158); list.setSize(w - 40, h - (narrow ? 268 : 224));
    view.getChild('summary').setPosition(20, h - 48); view.getChild('summary').setSize(w - 40, 42);
    view.getChild('summary').textFormat.size = narrow ? 14 : 18; view.getChild('summary').applyFormat();
    list.refreshVirtualList();
  };
  window.addEventListener('resize', resize);
  resize(); release = store.subscribe(render); render();
  view.getTransition('enter')?.play();
  metrics.opened++;
  document.getElementById('launch') .style.display = 'none';
  requestAnimationFrame(() => { (window       ).verification.lastOpenMs = performance.now() - begin; });
}
function close() {
  if (!view) return;
  release(); window.removeEventListener('resize', resize); exitPopup();
  release = () => {}; resize = () => {};
  view.dispose(); view = null; metrics.closed++;
  document.getElementById('launch') .style.display = 'block';
}

(window       ).verification = {
  metrics, snapshot: () => store.snapshot(), open, close, progress: () => store.progress(),
  inspect: () => ({ open: !!view, listenerCount: store.listenerCount, rowNodes: view?.getChild('list').numChildren || 0, allNodes: document.querySelectorAll('*').length, scrollY: view?.getChild('list').scrollPane.posY || 0, transition: !!view?.getTransition('enter'), controller: view?.getChild('list').getChildAt(0)?.getController('state')?.selectedPage, popup: !!popup }),
};
document.getElementById('launch') .addEventListener('click', open);
try {
  const loadStart = performance.now();
  const pkg      = await Promise.race([fgui.UIPackage.loadPackage('./assets/Inventory'), new Promise((_, reject) => setTimeout(() => reject(new Error('FairyGUI package load exceeded 8s')), 8000))]);
  const response = await fetch('./assets/Inventory/manifest.json');
  if (!response.ok) throw new Error('Missing DOM loose-image manifest');
  const manifest = await response.json();
  for (const [id, file] of Object.entries(manifest.packages[pkg.id].images)) {
    const item = pkg.getItemById(id);
    if (!item) throw new Error('Manifest image not found: ' + id);
    item.file = new URL('./assets/Inventory/' + file, location.href).href;
  }
  (window       ).verification.packageMs = performance.now() - loadStart;
  open(); (window       ).verification.readyMs = performance.now();
  (window       ).verification.ready = true;
  await document.fonts.ready;
  await Promise.all(Object.values(manifest.packages[pkg.id].images).map(file => {
    const image = new Image(); image.src = new URL('./assets/Inventory/' + file, location.href).href;
    return image.decode();
  }));
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  (window       ).verification.assetsAndTwoFramesMs = performance.now();
} catch (error) { document.getElementById('failure') .textContent = String(error); console.error(error); (window       ).verification.failure = String(error); }
