// FairyGUI 事件 → 接口层的 PointerInput。不做按对象缓存：运行库的事件对象是池化复用的
// （borrowEvent），同一次派发里舞台和控件各转一次，值相同、语义不变（h5 的去重是 DOM 特有）。
// 运行库的事件不带时间戳，InputProcessor 从引擎输入回调里同步派发，取转换时刻即可。
import type {PointerInput} from '../../core/index';
import {Event} from './vendor/fairygui.mjs';

const types: Record<string, PointerInput['type']> = {
  [Event.TOUCH_BEGIN]: 'down',
  [Event.TOUCH_MOVE]: 'move',
  [Event.TOUCH_END]: 'up' // 取消也派发为 TOUCH_END（运行库如此）；手势层按移动量判断，不依赖 cancel
};

export function toPointerInput(event: FguiEventOf): PointerInput {
  const type = types[event.type];
  if (!type) throw new Error(`未知的事件类型 ${event.type}`);
  return {
    type,
    pointerId: event.touchId,
    // 运行库的事件只有 touchId：有触摸 id 的是触摸，否则是鼠标；笔在 Web 上按触摸对待。
    pointerType: event.touchId >= 0 ? 'touch' : 'mouse',
    x: event.pos.x,
    y: event.pos.y,
    time: performance.now()
  };
}

/** 只在运行库事件对象上用（它的类型随环境变化，这里收窄成我们读的字段）。 */
export interface FguiEventOf {
  readonly type: string;
  readonly pos: {x: number; y: number};
  readonly touchId: number;
  readonly mouseWheelDelta: number;
}
