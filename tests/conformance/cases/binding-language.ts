// 绑定和语言：点两次按钮，状态文字跟着数据变；换成英文后固定文字和动态文字都换掉。
import type { Case } from '../harness';
import { mainModel } from '../src/modules/main/MainModel';

const c: Case = {
  screen: { width: 1280, height: 720 },
  async run(t) {
    await t.click('Main/MainView.button');
    await t.click('Main/MainView.button');
    await t.setLanguage('en');
    return mainModel.get();
  },
};
export default c;
