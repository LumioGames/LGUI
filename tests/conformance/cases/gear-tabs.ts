// 齿轮和标签页：tabs 模板的两页内容挂着 gearDisplay，切页以后 visible（真的显示）跟着变；被藏起来的那一页在两个后端上都算不显示。
import type { Case } from '../harness';
import { ShopPanelView } from '../src/modules/shop/ShopPanelView';

const c: Case = {
  screen: { width: 1280, height: 720 },
  async run(t) {
    await t.open(ShopPanelView);
    const read = () => [t.visible('Shop/ShopPanel.firstContent'), t.visible('Shop/ShopPanel.secondContent')];
    const first = read();
    await t.click('Shop/ShopPanel.secondTab');
    const second = read();
    return { first, second };
  },
};
export default c;
