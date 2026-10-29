import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {importTs, typecheck} from '../../helpers/ts.mjs';

const entry = fileURLToPath(new URL('../../../plugin/framework/backends/unity/adapter/objects.ts', import.meta.url));
let implementation;
async function adapter(...args) {
  try { implementation ??= await importTs(entry); }
  catch (error) { assert.fail(`Unity UI object adapter is unavailable: ${error.message}`); }
  return implementation.createObjectAdapter(...args);
}

class Listener {
  handlers = new Set();
  Add(fn) { this.handlers.add(fn); }
  Remove(fn) { this.handlers.delete(fn); }
  AddCapture(fn) { this.Add(fn); }
  RemoveCapture(fn) { this.Remove(fn); }
  Call(data) { const event = data?.inputEvent ? data : {data, inputEvent: null}; for (const fn of [...this.handlers]) fn(event); }
}
class Obj {
  name = ''; visible = true; grayed = false; touchable = true;
  x = 0; y = 0; width = 10; height = 20; data = null; packageItem = null; parent = null;
  onTouchBegin = new Listener(); onTouchMove = new Listener(); onTouchEnd = new Listener();
  onRollOver = new Listener(); onRollOut = new Listener();
  SetXY(x, y) { this.x = x; this.y = y; }
  SetSize(width, height) { this.width = width; this.height = height; }
  get enabled() { return !this.grayed && this.touchable; }
  set enabled(value) { this.grayed = !value; this.touchable = value; }
  Dispose() { this.disposed = true; }
}
class Component extends Obj {
  children = []; controllers = new Map(); transitions = new Map();
  get numChildren() { return this.children.length; }
  GetChild(name) { return this.children.find(x => x.name === name) ?? null; }
  GetChildAt(index) { return this.children[index]; }
  GetChildIndex(child) { return this.children.indexOf(child); }
  GetController(name) { return this.controllers.get(name) ?? null; }
  GetTransition(name) { return this.transitions.get(name) ?? null; }
  AddChild(child) { this.children.push(child); child.parent = this; return child; }
  RemoveChild(child) { this.children.splice(this.children.indexOf(child), 1); return child; }
}
class Text extends Obj { text = ''; color = {r: 1, g: 1, b: 1, a: 1}; }
class Input extends Text { promptText = ''; onChanged = new Listener(); }
class Button extends Component { title = ''; icon = ''; selected = false; }
class Image extends Obj { fillMethod = 0; fillOrigin = 0; fillClockwise = true; fillAmount = 1; }
class Loader extends Obj { url = ''; texture = null; component = null; onLoaded = new Listener(); onLoadError = new Listener(); }
class Graph extends Obj { color = {r: 1, g: 1, b: 1, a: 1}; }
class Progress extends Component { value = 0; max = 100; }
class List extends Component {
  numItems = 0; itemRenderer = null; selectedIndex = -1; onClickItem = new Listener(); first = 0;
  scrollPane = {posX: 0, posY: 0, SetPosX(x) { this.posX = x; }, SetPosY(y) { this.posY = y; }};
  SetVirtual() { this.virtualCalls = (this.virtualCalls ?? 0) + 1; }
  ItemIndexToChildIndex(index) { return index - this.first; }
  ChildIndexToItemIndex(index) { return index + this.first; }
  ScrollToView(index) { this.scrolledTo = index; }
}
const fgui = {
  GComponent: Component, GTextField: Text, GTextInput: Input, GButton: Button,
  GImage: Image, GLoader: Loader, GList: List, GGraph: Graph, GProgressBar: Progress,
  Stage: {touchScreen: false}, UIPackage: {GetItemByURL() { return null; }},
  Utils: {ToolSet: {ConvertFromHtmlColor(value) {
    const hex = value.slice(1); const alpha = hex.length === 8 ? parseInt(hex.slice(0, 2), 16) / 255 : 1;
    const rgb = hex.slice(-6);
    return {r: parseInt(rgb.slice(0, 2), 16) / 255, g: parseInt(rgb.slice(2, 4), 16) / 255, b: parseInt(rgb.slice(4, 6), 16) / 255, a: alpha};
  }}}
};
const context = (x, y, touchId = -1) => ({inputEvent: {x, y, touchId, button: 0}, data: null, CaptureTouch() { this.captured = true; }});

test('Unity wrappers preserve object identity, nested lookup and native ownership', async () => {
  const a = await adapter(fgui, () => 100, (x, y) => ({x: x / 2, y: y / 2}));
  const root = new Component(); root.name = 'root';
  const sub = new Component(); sub.name = 'header'; root.AddChild(sub);
  const text = new Text(); text.name = 'title'; sub.AddChild(text);
  a.setComponentName(root, 'Bag/Panel');
  const wrapped = a.wrapComponent(root);
  assert.equal(wrapped.componentName, 'Bag/Panel');
  assert.strictEqual(a.wrap(root), wrapped);
  assert.strictEqual(wrapped.child('header.title'), a.wrap(text));
  assert.equal(wrapped.child('header.missing'), null);
  assert.equal(wrapped.child('header.title.nope'), null);
  assert.deepEqual(wrapped.childNames(), ['header']);
  const label = wrapped.child('header.title'); label.text = '金币'; label.color = '#1234ab';
  assert.equal(text.text, '金币'); assert.equal(label.color, '#1234ab');
  assert.throws(() => { label.color = 'not a color'; }, {code: 'LGUI-RT-020'});
  label.rect = {x: 2, y: 3, width: 40, height: 50};
  assert.deepEqual(label.rect, {x: 2, y: 3, width: 40, height: 50});
  assert.strictEqual(a.nativeOf(label), text);
  assert.throws(() => a.nativeOf({name: 'alien'}), {code: 'LGUI-RT-024'});
  assert.throws(() => a.wrapComponent(text), {code: 'LGUI-RT-023'});
});

test('Unity pointer subscribers share normalized input with the stage and detach the same delegates', async () => {
  let time = 100;
  const a = await adapter(fgui, () => time, (x, y) => ({x: x / 2, y: y / 2}));
  const native = new Button(); const wrapped = a.wrap(native); const events = [];
  const off = wrapped.onPointer(event => events.push(event));
  const event = context(40, 60, 7);
  fgui.Stage.touchScreen = true;
  native.onTouchBegin.Call(event);
  assert.deepEqual(events[0], {type: 'down', pointerId: 7, pointerType: 'touch', x: 20, y: 30, time: 100});
  assert.strictEqual(a.toPointerInput('down', event), events[0]);
  time = 120; event.inputEvent.x = 44; native.onTouchMove.Call(event);
  assert.equal(events[1].x, 22); assert.equal(events[1].type, 'move');
  off(); off(); native.onTouchEnd.Call(event);
  assert.equal(events.length, 2);
  assert.equal(native.onTouchBegin.handlers.size, 0); assert.equal(native.onTouchMove.handlers.size, 0);
  fgui.Stage.touchScreen = false;
});

test('Unity list maps virtual child indices, keeps non-button selection and disposes renderer callbacks', async () => {
  const a = await adapter(fgui, () => 0, (x, y) => ({x, y}));
  const native = new List(); const item = new Component(); native.AddChild(item); native.first = 4;
  const list = a.wrap(native); const rendered = [];
  list.itemRenderer = (index, wrapped) => rendered.push([index, wrapped]);
  native.itemRenderer(4, item);
  assert.strictEqual(rendered[0][1], a.wrapComponent(item));
  list.numItems = 8; list.selectedIndex = 5; assert.equal(list.selectedIndex, 5);
  const clicks = []; const off = list.onClickItem(index => clicks.push(index));
  native.onClickItem.Call(item); assert.deepEqual(clicks, [4]); assert.equal(list.selectedIndex, 4);
  assert.strictEqual(list.itemAt(4), a.wrapComponent(item)); assert.equal(list.itemAt(3), null);
  list.scrollPosition = {x: 12, y: 33}; assert.deepEqual(list.scrollPosition, {x: 12, y: 33});
  list.virtual = true; list.virtual = true; assert.equal(native.virtualCalls, 1);
  assert.throws(() => { list.virtual = false; }, {code: 'LGUI-RT-021'});
  list.numItems = 2; assert.equal(list.selectedIndex, -1);
  off(); native.onClickItem.Call(item); assert.deepEqual(clicks, [4]);
  list.itemRenderer = null; assert.equal(native.itemRenderer, null);
});

test('Unity loader forwards native completion and failure without publishing stale URLs', async () => {
  const a = await adapter(fgui, () => 0, (x, y) => ({x, y}));
  const native = new Loader(); const loader = a.wrap(native); const loads = []; const errors = [];
  const offLoad = loader.onLoad(() => loads.push(loader.url));
  const offError = loader.onError(url => errors.push(url));
  loader.url = 'https://example.test/a.png';
  loader.url = 'https://example.test/b.png';
  native.onLoaded.Call('https://example.test/a.png');
  assert.deepEqual(loads, []);
  native.onLoaded.Call('https://example.test/b.png');
  assert.deepEqual(loads, ['https://example.test/b.png']);
  native.onLoadError.Call('https://example.test/b.png');
  assert.deepEqual(errors, ['https://example.test/b.png']);
  offLoad(); offError(); native.onLoaded.Call('https://example.test/b.png');
  assert.equal(loads.length, 1); assert.equal(native.onLoaded.handlers.size, 0); assert.equal(native.onLoadError.handlers.size, 0);
});

test('Unity controller changes, text input, image fill, colors and transition callbacks use native contracts', async () => {
  const a = await adapter(fgui, () => 0, (x, y) => ({x, y}));
  const native = new Component();
  const controller = {name: 'tabs', selectedPage: 'bag', pageCount: 2, GetPageName(i) {return ['bag','shop'][i];}, onChanged: new Listener()};
  native.controllers.set('tabs', controller);
  const transition = {name: 'fade', Play(times, delay, callback) {this.play = {times, delay}; this.complete = callback;}, Stop(complete, callback) {this.stop = {complete, callback};}, SetPaused(value) {this.paused = value;}};
  native.transitions.set('fade', transition);
  const component = a.wrapComponent(native); const tabs = component.controller('tabs');
  const pages = []; const off = tabs.onChange(page => pages.push(page));
  tabs.selectedPage = 'shop'; controller.onChanged.Call(); assert.deepEqual(pages, ['shop']);
  assert.throws(() => {tabs.selectedPage = 'missing';}, {code: 'LGUI-RT-022'}); off();
  assert.strictEqual(tabs, component.controller('tabs'));
  const input = new Input(); const wrappedInput = a.wrap(input); const changes = [];
  wrappedInput.promptText = '搜索'; assert.equal(input.promptText, '搜索');
  const offInput = wrappedInput.onChange(value => changes.push(value)); input.text = '剑'; input.onChanged.Call(); assert.deepEqual(changes, ['剑']); offInput();
  const image = new Image(); const wrappedImage = a.wrap(image); wrappedImage.fillMethod = 'radial180'; wrappedImage.fillAmount = .25;
  assert.equal(image.fillMethod, 4); assert.equal(wrappedImage.fillMethod, 'radial180'); assert.equal(image.fillAmount, .25);
  const graph = new Graph(); a.wrap(graph).color = '#80ff0000'; assert.equal(graph.color.a, 128 / 255); assert.equal(a.wrap(graph).color, '#80ff0000');
  const progress = new Progress(); const wrappedProgress = a.wrap(progress); wrappedProgress.value = 15; wrappedProgress.max = 20; assert.equal(progress.value, 15); assert.equal(progress.max, 20);
  const effect = component.transition('fade'); const done = effect.play({times: 2, delay: .5}); assert.deepEqual(transition.play, {times: 2, delay: .5});
  transition.complete(); await done; effect.setPaused(true); assert.equal(transition.paused, true); effect.stop(); assert.deepEqual(transition.stop, {complete: true, callback: false});
});

test('Unity UI wrapper satisfies core interfaces under strict TypeScript without browser globals', () => {
  assert.deepEqual(typecheck([entry]), []);
});

test('Unity hover routes the stage move to the hit object and its ancestors before stage recognition', async () => {
  const a = await adapter(fgui, () => 12, (x, y) => ({x, y}));
  const root = new Component(); const child = new Button(); root.AddChild(child);
  const input = context(40, 60, 0); const seen = [];
  const offParent = a.wrap(root).onPointer(event => seen.push(['parent', event]));
  const offChild = a.wrap(child).onPointer(event => seen.push(['child', event]));
  a.dispatchHover(child, input);
  const stageInput = a.toPointerInput('move', input);
  assert.deepEqual(seen.map(([name]) => name), ['child', 'parent']);
  assert.strictEqual(seen[0][1], stageInput); assert.strictEqual(seen[1][1], stageInput);
  assert.equal(stageInput.pointerType, 'mouse', 'Unity uses touchId 0 for a mouse too');
  offParent(); offChild(); a.dispatchHover(child, input); assert.equal(seen.length, 2);
});

test('Unity delivers a captured mouse move once per subscriber across hover and native monitor routes', async () => {
  const a = await adapter(fgui, () => 12, (x, y) => ({x, y}));
  const native = new Button();
  const first = [], second = [];
  const offFirst = a.wrap(native).onPointer(event => first.push(event));
  const offSecond = a.wrap(native).onPointer(event => second.push(event));
  const event = context(40, 60, 0);

  // FairyGUI TouchInfo.Move sends the stage capture chain before GObject monitors.
  a.dispatchHover(native, event);
  const stageInput = a.toPointerInput('move', event);
  native.onTouchMove.Call(event);
  assert.equal(first.length, 1);
  assert.equal(second.length, 1);
  assert.strictEqual(first[0], stageInput);
  assert.strictEqual(second[0], stageInput);

  // A new frame reuses the C# InputEvent, but must still deliver a fresh move.
  a.clearPointerCache();
  a.dispatchHover(native, event);
  native.onTouchMove.Call(event);
  assert.equal(first.length, 2);
  assert.equal(second.length, 2);
  assert.notStrictEqual(first[1], first[0]);

  offFirst();
  a.clearPointerCache();
  a.dispatchHover(native, event);
  native.onTouchMove.Call(event);
  assert.equal(first.length, 2);
  assert.equal(second.length, 3);
  offSecond();
});

test('Unity pointer subscriptions remain independent when the same callback is registered twice', async () => {
  const a = await adapter(fgui, () => 12, (x, y) => ({x, y}));
  const native = new Button(); const seen = [];
  const handler = event => seen.push(event);
  const offFirst = a.wrap(native).onPointer(handler);
  const offSecond = a.wrap(native).onPointer(handler);
  const event = context(40, 60, 0);
  a.dispatchHover(native, event);
  native.onTouchMove.Call(event);
  assert.equal(seen.length, 2);
  offFirst();
  a.clearPointerCache();
  a.dispatchHover(native, event);
  native.onTouchMove.Call(event);
  assert.equal(seen.length, 3);
  offSecond();
});

test('Unity component disposal detaches descendant and controller subscriptions and list delegates', async () => {
  const a = await adapter(fgui, () => 0, (x, y) => ({x, y}));
  const root = new Component(); const list = new List(); const loader = new Loader(); root.AddChild(list); root.AddChild(loader);
  const controller = {name: 'tabs', selectedPage: 'bag', pageCount: 1, GetPageName() {return 'bag';}, onChanged: new Listener()};
  root.controllers.set('tabs', controller);
  a.wrap(loader).onLoad(() => {}); a.wrap(list).onClickItem(() => {}); a.wrap(list).itemRenderer = () => {};
  a.wrapComponent(root).controller('tabs').onChange(() => {});
  a.wrapComponent(root).dispose();
  assert.equal(loader.onLoaded.handlers.size, 0); assert.equal(list.onClickItem.handlers.size, 0);
  assert.equal(list.itemRenderer, null); assert.equal(controller.onChanged.handlers.size, 0);
});

test('Unity object adapter disposal releases active native subscriptions even without a component close', async () => {
  const a = await adapter(fgui, () => 0, (x, y) => ({x, y}));
  const native = new Button(); a.wrap(native).onPointer(() => {});
  const list = new List(); a.wrap(list).itemRenderer = () => {};
  a.dispose(); a.dispose();
  assert.equal(native.onTouchBegin.handlers.size, 0); assert.equal(native.onTouchMove.handlers.size, 0); assert.equal(native.onTouchEnd.handlers.size, 0);
  assert.equal(list.itemRenderer, null);
});
