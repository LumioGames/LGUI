import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {importTs, typecheck} from '../../helpers/ts.mjs';

const entry = fileURLToPath(new URL('../../../plugin/framework/backends/unity/adapter/platform.ts', import.meta.url));
let module;
async function create(options = {}) {
  if (!module && fs.existsSync(entry)) module = await importTs(entry);
  assert.equal(typeof module?.createUnityPlatform, 'function', 'Unity 平台应提供完整的平台服务工厂');
  return module.createUnityPlatform(options);
}

class Listener {
  handlers = new Set();
  captures = new Set();
  Add(h) { this.handlers.add(h); }
  Remove(h) { this.handlers.delete(h); }
  AddCapture(h) { this.captures.add(h); }
  RemoveCapture(h) { this.captures.delete(h); }
  emit(context) { for (const h of [...this.captures, ...this.handlers]) h(context); }
  get count() { return this.handlers.size + this.captures.size; }
}

function environment() {
  const calls = [];
  const storage = new Map();
  const listeners = new Map();
  const event = name => {
    if (!listeners.has(name)) listeners.set(name, new Listener());
    return listeners.get(name);
  };
  const stage = {
    onTouchBegin: event('onTouchBegin'), onTouchMove: event('onTouchMove'), onTouchEnd: event('onTouchEnd'),
    onMouseWheel: event('onMouseWheel'), onKeyDown: event('onKeyDown'), onStageResized: event('onStageResized'),
    AddEventListener: (name, h) => event(name).Add(h), RemoveEventListener: (name, h) => event(name).Remove(h),
    AddCapture: (name, h) => event(name).AddCapture(h), RemoveCapture: (name, h) => event(name).RemoveCapture(h)
  };
  const root = {SetContentScaleFactor: value => calls.push(['scale', value]), SetSize: (w, h) => calls.push(['size', w, h])};
  const packages = new Set();
  const host = {
    Now: 123, ScreenWidth: 1280, ScreenHeight: 720,
    SafeAreaTop: 10, SafeAreaRight: 20, SafeAreaBottom: 30, SafeAreaLeft: 40,
    IsComposing: false, SystemLanguage: 'zh-CN', InputMode: 'ui', WheelDeltaX: 12,
    StorageGet: (project, key) => storage.get(`${project}:${key}`) ?? null,
    StorageSet: (project, key, value) => storage.set(`${project}:${key}`, value),
    StorageRemove: (project, key) => storage.delete(`${project}:${key}`),
    LoadText: resource => resource,
    Log: (level, message) => calls.push(['log', level, message]),
    SetInputMode: mode => { host.InputMode = mode; },
    PlayAudio: (url, volume) => calls.push(['audio', url, volume]),
    Fetch: (...args) => calls.push(['fetch', ...args])
  };
  const scale = {value: 1};
  const objects = {
    toPointerInput: (type, ctx) => ({type, pointerId: ctx.inputEvent.touchId, pointerType: 'mouse', x: ctx.inputEvent.x / scale.value, y: ctx.inputEvent.y / scale.value, time: host.Now}),
    clearPointerCache() {}, dispatchHover() {}
  };
  const loaders = [];
  const createLoader = () => {
    const loader = {url: '', onLoaded: new Listener(), onLoadError: new Listener(), Dispose() { this.disposed = true; }};
    loaders.push(loader);
    return loader;
  };
  const fgui = {
    Stage: {touchScreen: false, inst: stage}, GRoot: {inst: root},
    UIPackage: {
      GetByName: name => packages.has(name) ? {} : null,
      AddPackage: path => { calls.push(['package', path]); packages.add(path.split('/').at(-1)); return {}; },
      RemovePackage: name => { calls.push(['release', name]); packages.delete(name); },
      GetItemAssetByURL: url => url === 'ui://Bag/icon' ? {} : null
    }
  };
  return {options: {projectName: 'test', uiBase: 'UI', host, fgui, objects, createLoader, scale}, calls, host, stage, root, listeners, event, loaders, scale, storage};
}

test('Unity 平台：存储按工程隔离，时间事件可取消，退出后停止派发', async () => {
  const e = environment();
  const u = await create(e.options);
  const p = u.platform;
  assert.equal(p.time.now(), 123);
  p.storage.set('save', 'one');
  assert.equal(p.storage.get('save'), 'one');
  const other = await create({...e.options, projectName: 'other'});
  assert.equal(other.platform.storage.get('save'), null);
  p.storage.remove('save');
  assert.equal(p.storage.get('save'), null);
  const frames = [], visible = [];
  const offFrame = p.time.onFrame(dt => frames.push(dt));
  p.time.onVisibilityChange(value => visible.push(value));
  u.tick(16); offFrame(); u.tick(17);
  u.visibility(false); u.visibility(true);
  assert.deepEqual(frames, [16]);
  assert.deepEqual(visible, [false, true]);
  u.dispose(); u.visibility(false); u.tick(18);
  assert.deepEqual(visible, [false, true]);
  other.dispose();
  assert.equal([...e.listeners.values()].reduce((n, l) => n + l.count, 0), 0);
});

test('Unity 平台：设计尺寸、安全区、旋转通知和原始输入使用相同缩放', async () => {
  const e = environment(); const u = await create(e.options); const p = u.platform;
  assert.deepEqual(p.screen.applyDesignSize({width: 1920, height: 1080}), {x: 0, y: 0, width: 1920, height: 1080});
  assert.equal(e.scale.value, 2 / 3);
  assert.deepEqual(p.screen.safeArea(), {top: 10, right: 20, bottom: 30, left: 40});
  const points = [], keys = [], wheels = [], sizes = [];
  p.input.onPointer(value => points.push(value)); p.input.onKey(value => keys.push(value));
  p.input.onWheel(value => wheels.push(value)); p.screen.onResize(value => sizes.push(value));
  const ctx = {inputEvent: {x: 640, y: 360, touchId: 0, keyCode: 13, character: '\0', mouseWheelDelta: 40}};
  e.event('onTouchBegin').emit(ctx);
  assert.deepEqual(points[0], {type: 'down', pointerId: 0, pointerType: 'mouse', x: 960, y: 540, time: 123});
  e.event('onKeyDown').emit(ctx); e.event('onKeyDown').emit(ctx); e.event('onKeyUp').emit(ctx);
  assert.deepEqual(keys, [{type: 'down', key: 'Enter', repeat: false}, {type: 'down', key: 'Enter', repeat: true}, {type: 'up', key: 'Enter', repeat: false}]);
  e.host.IsComposing = true; e.event('onKeyDown').emit(ctx);
  assert.equal(keys.length, 3); assert.equal(p.textInput.isComposing(), true);
  e.event('onMouseWheel').emit(ctx);
  assert.deepEqual(wheels[0], {x: 960, y: 540, deltaX: 18, deltaY: 60});
  e.host.ScreenWidth = 720; e.host.ScreenHeight = 1280; u.tick(16);
  assert.deepEqual(sizes, [{width: 720, height: 1280}]);
  p.input.setInputMode('all'); assert.equal(e.host.InputMode, 'all');
  u.dispose();
});

test('Unity 平台：HTTP 回调转成响应；网络失败与未实现的 WebSocket 明确报错', async () => {
  const e = environment(); const u = await create(e.options); const p = u.platform;
  const request = p.net.fetch('https://game.test/a', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{}'});
  const sent = e.calls.find(x => x[0] === 'fetch');
  assert.deepEqual(sent.slice(1, 6), ['https://game.test/a', 'POST', '{"items":[{"name":"Content-Type","value":"application/json"}]}', '{}', sent[5]]);
  sent[5](JSON.stringify({status: 201, text: '{"ok":true}', error: ''}));
  const response = await request;
  assert.equal(response.status, 201); assert.equal(response.ok, true);
  assert.equal(await response.text(), '{"ok":true}'); assert.deepEqual(await response.json(), {ok: true});
  const bad = p.net.fetch('https://game.test/fail');
  e.calls.at(-1)[5](JSON.stringify({status: 0, text: '', error: 'connection refused'}));
  await assert.rejects(bad, error => error.code === 'LGUI-RT-101' && /connection refused/.test(error.message));
  assert.throws(() => p.net.webSocket('wss://game.test'), error => error.code === 'LGUI-RT-001');
  u.dispose();
});

test('Unity 平台：字母抬起保留按下的键名；失焦取消未结束的指针', async () => {
  const e = environment(); const u = await create(e.options); const p = u.platform;
  const keys = [], points = [];
  p.input.onKey(value => keys.push(value)); p.input.onPointer(value => points.push(value));
  const ctx = {inputEvent: {x: 5, y: 6, touchId: 2, keyCode: 97, character: 'A', mouseWheelDelta: 0}};
  e.event('onKeyDown').emit(ctx);
  ctx.inputEvent.character = '\0'; e.event('onKeyUp').emit(ctx);
  assert.deepEqual(keys, [{type: 'down', key: 'A', repeat: false}, {type: 'up', key: 'A', repeat: false}]);
  e.event('onTouchBegin').emit(ctx); e.host.Now = 456; u.visibility(false);
  assert.deepEqual(points.at(-1), {type: 'cancel', pointerId: 2, pointerType: 'mouse', x: 5, y: 6, time: 456});
  u.visibility(false); assert.equal(points.length, 2, '同一个未结束指针只取消一次');
  u.dispose();
});

test('Unity 平台：包去重、图片完成或失败时释放临时加载器，退出取消待加载', async () => {
  const e = environment(); const u = await create(e.options); const p = u.platform;
  await p.resource.loadPackage('Bag'); await p.resource.loadPackage('Bag');
  assert.equal(e.calls.filter(x => x[0] === 'package').length, 1);
  assert.equal(p.resource.hasPackage('Bag'), true);
  p.resource.releasePackage('Bag'); assert.equal(p.resource.hasPackage('Bag'), false);
  await p.resource.loadImage('ui://Bag/icon');
  await assert.rejects(p.resource.loadImage('ui://Bag/missing'), error => error.code === 'LGUI-RT-025');
  const loaded = p.resource.loadImage('https://game.test/icon.png');
  const loader = e.loaders.at(-1); assert.equal(loader.url, 'https://game.test/icon.png');
  loader.onLoaded.emit({data: loader.url}); await loaded;
  assert.equal(loader.disposed, true); assert.equal(loader.onLoaded.count + loader.onLoadError.count, 0);
  const failed = p.resource.loadImage('https://game.test/missing.png');
  const broken = e.loaders.at(-1); broken.onLoadError.emit({data: broken.url});
  await assert.rejects(failed, error => error.code === 'LGUI-RT-025');
  assert.equal(broken.disposed, true);
  const pending = p.resource.loadImage('https://game.test/pending.png');
  const abandoned = e.loaders.at(-1); u.dispose();
  await assert.rejects(pending, error => error.code === 'LGUI-RT-025');
  assert.equal(abandoned.disposed, true);
});

test('Unity 平台：日志只保留最近 200 条，音频音量和系统语言交给原生服务', async () => {
  const e = environment(); const u = await create(e.options); const p = u.platform;
  for (let i = 0; i < 205; i++) { e.host.Now = i; p.log.write('info', String(i)); }
  assert.equal(p.log.recent().length, 200); assert.equal(p.log.recent()[0].message, '5');
  assert.equal(p.log.recent().at(-1).time, 204);
  p.audio.play('ui://Common/click', {volume: 0.5});
  assert.deepEqual(e.calls.at(-1), ['audio', 'ui://Common/click', 0.5]);
  assert.deepEqual(p.locale.systemLanguages(), ['zh-CN']);
  u.dispose();
});

test('Unity 平台：原生包和图片异常转为有错误码的失败', async () => {
  const e = environment();
  e.options.fgui.UIPackage.AddPackage = () => { throw new Error('missing _fui.bytes'); };
  e.options.fgui.UIPackage.GetItemAssetByURL = () => { throw new Error('broken texture'); };
  e.options.createLoader = () => { throw new Error('loader unavailable'); };
  const u = await create(e.options); const p = u.platform;
  await assert.rejects(p.resource.loadPackage('Missing'), error => error.code === 'LGUI-RT-011' && /missing _fui.bytes/.test(error.message));
  await assert.rejects(p.resource.loadImage('ui://Missing/icon'), error => error.code === 'LGUI-RT-025' && /broken texture/.test(error.message));
  await assert.rejects(p.resource.loadImage('https://game.test/icon.png'), error => error.code === 'LGUI-RT-025' && /loader unavailable/.test(error.message));
  u.dispose();
});

test('Unity 平台在 strict、无 DOM 和无 any 的条件下通过类型检查', async () => {
  assert.equal(fs.existsSync(entry), true);
  assert.deepEqual(typecheck([entry]), []);
  assert.doesNotMatch(fs.readFileSync(entry, 'utf8'), /\bany\b/);
});
