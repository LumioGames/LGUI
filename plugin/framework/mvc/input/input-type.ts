// 当前的输入设备类型：最近一次是鼠标或键盘 → keyboardMouse，是触摸 → touch。visibleOn 和操作提示栏用它。
import type {InputType, Readable} from '../types';
import {bus} from '../events';
import {lgui} from '../lgui';

let current: InputType = 'keyboardMouse';
const listeners = new Set<() => void>();

export const inputType: Readable<InputType> & {set(type: InputType): void} = {
  get: () => current,
  subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  set(type) {
    if (type === current) return;
    current = type;
    for (const listener of [...listeners]) listener();
    bus.emit(lgui.events.inputTypeChange, {inputType: type});
  }
};
