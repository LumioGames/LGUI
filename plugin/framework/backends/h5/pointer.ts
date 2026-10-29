// 浏览器指针事件 → 接口层的 PointerInput。同一个 DOM 事件只转换一次（控件和舞台拿到的是同一个对象），手势识别靠它判断悬停。
import type {PointerInput} from '../../core/index';
import {toDesign} from './scale';

const types: Record<string, PointerInput['type']> = {pointerdown: 'down', pointermove: 'move', pointerup: 'up', pointercancel: 'cancel'};
const converted = new WeakMap<Event, PointerInput>();

export const pointerEventTypes = Object.keys(types);

export function toPointerInput(event: PointerEvent): PointerInput {
  let input = converted.get(event);
  if (!input) {
    const {x, y} = toDesign(event.clientX, event.clientY);
    const pointerType = event.pointerType === 'touch' || event.pointerType === 'pen' ? event.pointerType : 'mouse';
    input = {type: types[event.type], pointerId: event.pointerId, pointerType, x, y, time: performance.now()};
    converted.set(event, input);
  }
  return input;
}
