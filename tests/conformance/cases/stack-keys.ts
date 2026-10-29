// 界面栈和按键：打开标签页切到第二页，再弹出对话框；返回键先关对话框，再关标签页。
import type { Case } from '../harness';
import { ShopPanelView } from '../src/modules/shop/ShopPanelView';
import { AskDialogView } from '../src/modules/ask/AskDialogView';

const c: Case = {
  screen: { width: 1280, height: 720 },
  async run(t) {
    await t.open(ShopPanelView);
    await t.click('Shop/ShopPanel.secondTab');
    await t.open(AskDialogView);
    const withDialog = t.snapshot().layers;
    await t.key('Escape');
    const afterFirstBack = t.snapshot().layers;
    await t.open(AskDialogView);
    await t.click('Ask/AskDialog.okButton');
    return { withDialog, afterFirstBack };
  },
};
export default c;
