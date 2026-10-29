// 红点：每个红点用一个路径命名（bag.newItem、bag.equip）。下面任何一个亮了，上面的跟着亮；
// 值是数字时，上面的红点显示下面各个数字的合计。
import {LgRuntimeError} from '../core/index';
import type {Readable} from './types';

/** 一个红点路径当前的状态。 */
export interface RedDotState {
  /** 亮不亮。 */
  lit: boolean;
  /** 数字合计（没有数字时是 0）。 */
  count: number;
}

const values = new Map<string, boolean | number>();
const listeners = new Set<() => void>();

const valid = (path: string): boolean => /^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$/.test(path);

/** 所有红点的数据源（绑定表里的 redDot 用它）。 */
export const redDots: Readable<Map<string, boolean | number>> = {
  get: () => values,
  subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; }
};

/** 点亮（true 或数字）或熄灭（false、0）。 */
export function setRedDot(path: string, value: boolean | number): void {
  if (!valid(path)) throw new LgRuntimeError('LGUI-RT-120', `红点路径 ${path} 写法不对。`, '写成用「.」分隔的英文名，比如 bag.newItem。');
  if (value === false || value === 0) values.delete(path);
  else values.set(path, value);
  for (const listener of [...listeners]) listener();
}

/** 一个路径（连同它下面所有路径）的状态。 */
export function redDotState(path: string): RedDotState {
  let lit = false;
  let count = 0;
  for (const [key, value] of values) {
    if (key !== path && !key.startsWith(path + '.')) continue;
    lit = true;
    if (typeof value === 'number') count += value;
  }
  return {lit, count};
}

/** lgui.redDot.get：亮着时返回数字合计（没有数字时是 true），不亮返回 false。 */
export function getRedDot(path: string): boolean | number {
  const {lit, count} = redDotState(path);
  return lit ? (count > 0 ? count : true) : false;
}

/** 内部用：清空（测试之间用）。 */
export function clearRedDots(): void {
  values.clear();
  for (const listener of [...listeners]) listener();
}
