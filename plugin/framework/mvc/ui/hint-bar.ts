// 操作提示栏：列出激活界面里带 hint 的按键动作（比如「Esc 返回」「Enter 出售」）。用 Common 包里的 ActionHintBar 组件，
// 放在 toast 层（不收输入），贴着屏幕底部。触屏上没有按键，输入类型是 touch 时隐藏。
import type {Backend, Rect, UIComponent, UIList, UIText} from '../../core/index';
import {keysForAction} from '../input/keys';
import {inputType} from '../input/input-type';
import {t} from '../i18n';

/** 按键名在提示栏里怎么显示。 */
const keyLabels: Record<string, string> = {Escape: 'Esc', Enter: 'Enter', ' ': 'Space', Space: 'Space'};

/** 提示栏的一项。 */
export interface Hint {
  key: string;
  label: string;
}

/** 一个界面的 keys 表 → 提示栏的内容。返回键默认显示「返回」（文本键 lgui.back）；不能返回时不显示。 */
export function hintsFor(keys: Record<string, unknown>, canGoBack: boolean, platform: string, keyMap: Record<string, Record<string, string>>): Hint[] {
  const hints: Hint[] = [];
  const keyOf = (action: string): string | null => {
    const key = keysForAction(action, platform, keyMap).find(k => k !== 'Back');
    return key ? keyLabels[key] ?? key : null;
  };
  const back = keys.back ?? 'close';
  if (back !== 'none' && canGoBack) {
    const key = keyOf('back');
    if (key) hints.push({key, label: t('lgui.back')});
  }
  for (const [action, def] of Object.entries(keys)) {
    if (action === 'back' || !def || typeof def !== 'object' || !('hint' in def) || typeof (def as {hint?: unknown}).hint !== 'string') continue;
    const key = keyOf(action);
    if (key) hints.push({key, label: t((def as {hint: string}).hint)});
  }
  return hints;
}

export class HintBar {
  private hints: Hint[] = [];

  constructor(readonly component: UIComponent) {
    const list = component.child('list') as UIList | null;
    if (list) list.itemRenderer = (index, item) => {
      const key = item.child('key') as UIText | null;
      const label = item.child('label') as UIText | null;
      if (key) key.text = this.hints[index].key;
      if (label) label.text = this.hints[index].label;
    };
  }

  /** 更新内容并摆到可见区域的底部。 */
  update(hints: Hint[], visible: Rect): void {
    this.hints = hints;
    const list = this.component.child('list') as UIList | null;
    if (list) list.numItems = hints.length;
    const r = this.component.rect;
    this.component.rect = {x: 0, y: visible.height - r.height, width: visible.width, height: r.height};
    this.component.visible = hints.length > 0 && inputType.get() !== 'touch';
  }
}

/** Common 包里有 ActionHintBar 组件时才建提示栏。 */
export function canCreateHintBar(backend: Backend): boolean {
  return backend.has('Common', 'ActionHintBar');
}
