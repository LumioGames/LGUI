// 背包界面上的临时效果（金币变化时飘出的数字）。
import { lgui } from 'lgui';

export const bagFxModel = lgui.Model({ coinFx: '' }, set => ({
  show(delta: number) { set({ coinFx: delta >= 0 ? `+${delta}` : String(delta) }); },
  hide() { set({ coinFx: '' }); },
}));
