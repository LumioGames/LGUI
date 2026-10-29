// headless 后端的模拟操作（给 lgui test 用）：点击、长按、拖拽、滑动、双指缩放、滚轮、按键、打字、拖滑动条、选下拉框、换屏幕尺寸、假时钟。
import type {PointerInput, UIObject, WheelInput} from '../../core/index';
import {LgRuntimeError} from '../../core/index';
import type {HeadlessBackend} from './index';
import {HeadlessComboBox, HeadlessInput, HeadlessList, HeadlessSlider, HeadlessTree, asHeadless} from './objects';
import type {HeadlessObject} from './objects';

const FRAME = 16;

// 等这一帧里排队的 Promise 全部跑完（像真实的两帧之间一样）：Node 里等一次 setImmediate；没有时退回一次微任务。
const settle = (): Promise<void> => {
  const g = globalThis as {setImmediate?: (callback: () => void) => void};
  return g.setImmediate ? new Promise(resolve => g.setImmediate?.(resolve)) : Promise.resolve();
};

/** 让假时钟往前走，按每帧 16 毫秒触发每帧回调；每帧之后等排队的 Promise 跑完。 */
export async function advance(backend: HeadlessBackend, ms: number): Promise<void> {
  let left = ms;
  while (left > 0) {
    const step = Math.min(FRAME, left);
    backend.state.now += step;
    backend.state.handlers.frame.emit(step);
    left -= step;
    await settle();
  }
  await settle();
}

// 指针事件：和浏览器一样，先从目标往上冒泡给每一级的 onPointer，最后到舞台（原始输入）。
function send(backend: HeadlessBackend, target: HeadlessObject, type: PointerInput['type'], pointerId: number, x: number, y: number, pointerType: PointerInput['pointerType']): void {
  const event: PointerInput = {type, pointerId, pointerType, x, y, time: backend.state.now};
  for (let o: HeadlessObject | null = target; o; o = o.parent) o.pointer.emit(event);
  backend.state.handlers.pointer.emit(event);
}

/** 鼠标移到某个控件上（悬停），然后移到空白处。 */
export async function hover(backend: HeadlessBackend, object: UIObject, ms = 100): Promise<void> {
  const {o, x, y} = target(object);
  send(backend, o, 'move', 1, x, y, 'mouse');
  await advance(backend, ms);
  backend.state.handlers.pointer.emit({type: 'move', pointerId: 1, pointerType: 'mouse', x: -1, y: -1, time: backend.state.now});
  await advance(backend, 0);
}

// 和 FairyGUI 的各个运行时一样：文字、富文本、图片、序列帧动画自己收不到指针输入（点击会落到下面的控件上）。
const NOT_HIT = ['text', 'richtext', 'image', 'movieclip'];

function target(object: UIObject): {o: HeadlessObject; x: number; y: number} {
  const o = asHeadless(object);
  if (NOT_HIT.includes(o.kind)) throw new LgRuntimeError('LGUI-RT-032', `控件 ${o.name} 是文字、图片或序列帧动画，收不到点击和手势（各个后端都一样）。`, '把点击和手势绑在按钮、组件、列表或有填充的图形上。');
  if (!o.reachable()) throw new LgRuntimeError('LGUI-RT-032', `控件 ${o.name} 现在点不到（自己或上级没显示、被齿轮或组藏起来、不可用或不接收输入）。`, '检查这个控件和它所在的界面是不是显示、可用、激活；齿轮藏起来的控件先切到它显示的页。');
  const r = o.globalRect();
  return {o, x: r.x + r.width / 2, y: r.y + r.height / 2};
}

/** 列表、树的子项被点到时，像真实后端一样更新选中项并发出 click_item。 */
function notifyList(backend: HeadlessBackend, o: HeadlessObject): void {
  for (let child: HeadlessObject = o, p = o.parent; p; child = p, p = p.parent) {
    if (p instanceof HeadlessTree) { p.clickCell(child, backend.state.now); return; }
    if (p instanceof HeadlessList) {
      const index = p.children.indexOf(child);
      p.selectedIndex = index;
      p.clicks.emit(index);
      return;
    }
  }
}

/** 点击（按下到抬起，中间等 holdMs 毫秒；默认 50 毫秒）。 */
export async function click(backend: HeadlessBackend, object: UIObject, holdMs = 50, pointerType: PointerInput['pointerType'] = 'mouse'): Promise<void> {
  const {o, x, y} = target(object);
  send(backend, o, 'down', 1, x, y, pointerType);
  await advance(backend, holdMs);
  send(backend, o, 'up', 1, x, y, pointerType);
  notifyList(backend, o);
  await advance(backend, 0);
}

/** 双击。 */
export async function doubleClick(backend: HeadlessBackend, object: UIObject): Promise<void> {
  await click(backend, object);
  await advance(backend, 100);
  await click(backend, object);
}

/** 长按 ms 毫秒。 */
export function hold(backend: HeadlessBackend, object: UIObject, ms: number, pointerType: PointerInput['pointerType'] = 'mouse'): Promise<void> {
  return click(backend, object, ms, pointerType);
}

/** 拖拽：分 steps 步移动 (dx, dy)，用 durationMs 毫秒。 */
export async function drag(backend: HeadlessBackend, object: UIObject, dx: number, dy: number, durationMs = 400, steps = 10): Promise<void> {
  const {o, x, y} = target(object);
  send(backend, o, 'down', 1, x, y, 'touch');
  for (let i = 1; i <= steps; i++) {
    await advance(backend, durationMs / steps);
    send(backend, o, 'move', 1, x + (dx * i) / steps, y + (dy * i) / steps, 'touch');
  }
  send(backend, o, 'up', 1, x + dx, y + dy, 'touch');
  await advance(backend, 0);
}

/** 滑动：短时间内快速移动。 */
export function swipe(backend: HeadlessBackend, object: UIObject, dx: number, dy: number): Promise<void> {
  return drag(backend, object, dx, dy, 80, 4);
}

/** 双指缩放：两指从相距 100 像素变成 100 × scale。 */
export async function pinch(backend: HeadlessBackend, object: UIObject, scale: number, steps = 5): Promise<void> {
  const {o, x, y} = target(object);
  send(backend, o, 'down', 1, x - 50, y, 'touch');
  send(backend, o, 'down', 2, x + 50, y, 'touch');
  for (let i = 1; i <= steps; i++) {
    await advance(backend, 20);
    const half = 50 * (1 + ((scale - 1) * i) / steps);
    send(backend, o, 'move', 1, x - half, y, 'touch');
    send(backend, o, 'move', 2, x + half, y, 'touch');
  }
  send(backend, o, 'up', 1, x - 50 * scale, y, 'touch');
  send(backend, o, 'up', 2, x + 50 * scale, y, 'touch');
  await advance(backend, 0);
}

/** 滚轮：和浏览器一样，从目标往上冒泡给每一级的 onWheel，最后到舞台。 */
export async function wheel(backend: HeadlessBackend, object: UIObject, dy: number, dx = 0): Promise<void> {
  const {o, x, y} = target(object);
  const event: WheelInput = {x, y, deltaX: dx, deltaY: dy};
  for (let p: HeadlessObject | null = o; p; p = p.parent) p.wheels.emit(event);
  backend.state.handlers.wheel.emit(event);
  await advance(backend, 0);
}

const wrongControl = (o: HeadlessObject, what: string, kind: string): never => {
  throw new LgRuntimeError('LGUI-RT-150', `${what}只能用在${kind}上，${o.name} 不是${kind}。`, `换一个${kind}的路径（lgui ui list 里能看到控件类型）。`);
};

/** 打字：先点一下输入框、全选，再一个字一个字地输入（和真的键盘一样：第一个字替换原来的文字，之后每个字接在框里现在的文字后面，每个字通知一次）；text 是空字符串时清空（框里本来就空时不通知）。 */
export async function type(backend: HeadlessBackend, object: UIObject, text: string): Promise<void> {
  const o = asHeadless(object);
  if (!(o instanceof HeadlessInput)) wrongControl(o, '打字（t.type）', '输入框');
  await click(backend, o);
  const input = o as HeadlessInput;
  const chars = [...text];
  if (!chars.length && input.text) { input.text = ''; input.changes.emit(''); }
  chars.forEach((char, i) => { input.text = (i === 0 ? '' : input.text) + char; input.changes.emit(input.text); });
  await advance(backend, 0);
}

/** 拖滑动条：在滑动条上按下、抬起，滑块到 value（和 FairyGUI 一样夹在范围内、按设置取整，值变了才通知）。 */
export async function setValue(backend: HeadlessBackend, object: UIObject, value: number): Promise<void> {
  const {o, x, y} = target(object);
  if (!(o instanceof HeadlessSlider)) wrongControl(o, '拖滑动条（t.setValue）', '滑动条');
  send(backend, o, 'down', 1, x, y, 'mouse');
  (o as HeadlessSlider).move(value);
  send(backend, o, 'up', 1, x, y, 'mouse');
  await advance(backend, 0);
}

/** 选下拉框：点开下拉框，再点弹出列表里的第 index 项。 */
export async function choose(backend: HeadlessBackend, object: UIObject, index: number): Promise<void> {
  const o = asHeadless(object);
  if (!(o instanceof HeadlessComboBox)) wrongControl(o, '选下拉框（t.choose）', '下拉框');
  const combo = o as HeadlessComboBox;
  if (!Number.isInteger(index) || index < 0 || index >= combo.items.length) {
    throw new LgRuntimeError('LGUI-RT-151', `下拉框 ${o.name} 没有第 ${index} 项（一共 ${combo.items.length} 项）。`, '序号从 0 开始，先确认下拉框的 items 已经给好。');
  }
  await click(backend, combo);
  combo.choose(index);
  await advance(backend, 0);
}

/** 按一下键（按下再抬起）。 */
export async function key(backend: HeadlessBackend, name: string): Promise<void> {
  backend.state.handlers.key.emit({type: 'down', key: name, repeat: false});
  backend.state.handlers.key.emit({type: 'up', key: name, repeat: false});
  await advance(backend, 0);
}

/** 换屏幕尺寸（旋转）。 */
export async function setScreen(backend: HeadlessBackend, width: number, height: number): Promise<void> {
  backend.state.screen = {width, height};
  backend.state.handlers.resize.emit({width, height});
  await advance(backend, 0);
}

/** 换系统语言。 */
export function setSystemLanguages(backend: HeadlessBackend, languages: string[]): void {
  backend.state.languages = [...languages];
}
