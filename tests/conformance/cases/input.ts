// 输入框：t.type 用真的键盘一个字一个字地打（h5），input 每个字调用一次；Model 把文字改成大写，text 显示 Model 的值，
// 下一个字接在框里现在的文字后面。再打一次是替换；空字符串清空。
import { View, lgui, pick } from 'lgui';
import type { Bind } from 'lgui';
import type { ControlsPanelUI } from 'lgui/ui';
import type { Case } from '../harness';

const m = lgui.Model({ name: '', calls: [] as string[] }, (set, get) => ({
  setName(text: string) { set({ name: text.toUpperCase(), calls: [...get().calls, text] }); },
}));

class InputView extends View<ControlsPanelUI> {
  static component = 'Controls/ControlsPanel';
  static layer = 'page' as const;
  static fullScreen = true;
  static bothOrientations = true;
  bind: Bind<ControlsPanelUI> = {
    nameInput: { text: pick(m, s => s.name), input: text => m.setName(text) },
    nameText: { text: pick(m, s => s.name) },
  };
}

const c: Case = {
  screen: { width: 1280, height: 720 },
  async run(t) {
    await t.open(InputView);
    const P = 'Controls/ControlsPanel';
    await t.type(`${P}.nameInput`, 'abc');
    const first = t.text(`${P}.nameInput`);
    await t.type(`${P}.nameInput`, 'xy');
    const second = t.text(`${P}.nameInput`);
    await t.type(`${P}.nameInput`, '');
    return { first, second, model: m.get() };
  },
};
export default c;
