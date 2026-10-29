// lgui.debug.snapshot()：当前的界面栈、激活界面、每个界面的监听和定时器数量、已加载的包、方向、语言、输入类型。
// lgui test、lgui verify 跑完后输出它；lgui dev 里按 F8 打开调试面板。
import type {Layer} from './types';
import type {Snapshot} from './lgui';
import type {UIManager} from './ui/manager';
import {LAYERS} from './ui/manager';
import {currentLanguage} from './i18n';
import {inputType} from './input/input-type';
import {runtime} from './runtime';

/** 当前方向（S2-E1 之前按屏幕宽高判断）。 */
export const orientationState = {current: null as 'landscape' | 'portrait' | null};

export function snapshot(ui: UIManager): Snapshot {
  const layers = Object.fromEntries(LAYERS.map(layer => [layer, ui.stacks[layer].filter(e => e.state === 'open').map(e => e.cls.name)])) as Record<Layer, string[]>;
  const active = ui.all().find(e => e.active);
  const size = runtime().backend.platform.screen.size();
  return {
    layers,
    active: active ? active.cls.name : null,
    views: ui.views(),
    packages: ui.packageRefs(),
    orientation: orientationState.current ?? (size.width >= size.height ? 'landscape' : 'portrait'),
    language: currentLanguage(),
    inputType: inputType.get()
  };
}
