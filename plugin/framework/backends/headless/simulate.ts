// headless 后端的模拟操作（给 lgui test 用）：点击、长按、拖拽、拖放、滑动、双指缩放、滚轮、按键、换屏幕尺寸、假时钟。
import type {PointerInput, UIObject} from '../../core/index';
import {LgRuntimeError} from '../../core/index';
import type {HeadlessBackend} from './index';
import {HeadlessList, HeadlessObject, asHeadless} from './objects';

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
  HeadlessObject.pointerTarget = target;
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

// 和 FairyGUI 的各个运行时一样：文字、富文本、图片自己收不到指针输入（点击会落到下面的控件上）。
const NOT_HIT = ['text', 'richtext', 'image'];

function target(object: UIObject): {o: HeadlessObject; x: number; y: number} {
  const o = asHeadless(object);
  if (NOT_HIT.includes(o.kind)) throw new LgRuntimeError('LGUI-RT-032', `控件 ${o.name} 是文字或图片，收不到点击和手势（各个后端都一样）。`, '把点击和手势绑在按钮、组件、列表或有填充的图形上。');
  if (!o.reachable()) throw new LgRuntimeError('LGUI-RT-032', `控件 ${o.name} 现在点不到（自己或上级没显示、不可用或不接收输入）。`, '检查这个控件和它所在的界面是不是显示、可用、激活。');
  const r = o.globalRect();
  return {o, x: r.x + r.width / 2, y: r.y + r.height / 2};
}

/** 列表子项被点到时，像真实后端一样更新选中项并发出 click_item。 */
function notifyList(o: HeadlessObject): void {
  for (let child: HeadlessObject = o, p = o.parent; p; child = p, p = p.parent) {
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
  notifyList(o);
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

/** 拖放：在 from 上按住，移到 to 的中心松手（用 durationMs 毫秒，分 steps 步）。
 * 和触屏一样，移动途中的事件发给 from，最后一步和松手发给 to（「指针下面是谁」就是 to）。
 * headless 不算布局（列表子项都叠在列表左上角），所以第一步先往右移 20 像素，保证拖得起来。 */
export async function dragTo(backend: HeadlessBackend, from: UIObject, to: UIObject, durationMs = 400, steps = 10): Promise<void> {
  const a = target(from);
  const b = target(to);
  send(backend, a.o, 'down', 1, a.x, a.y, 'touch');
  await advance(backend, durationMs / steps);
  send(backend, a.o, 'move', 1, a.x + 20, a.y, 'touch');
  for (let i = 2; i <= steps; i++) {
    await advance(backend, durationMs / steps);
    const k = (i - 1) / (steps - 1);
    send(backend, i === steps ? b.o : a.o, 'move', 1, a.x + 20 + (b.x - a.x - 20) * k, a.y + (b.y - a.y) * k, 'touch');
  }
  send(backend, b.o, 'up', 1, b.x, b.y, 'touch');
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

/** 滚轮。 */
export async function wheel(backend: HeadlessBackend, object: UIObject, dy: number, dx = 0): Promise<void> {
  const {x, y} = target(object);
  backend.state.handlers.wheel.emit({x, y, deltaX: dx, deltaY: dy});
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
