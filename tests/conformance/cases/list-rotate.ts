// 列表、选中和旋转：点第 2 项再点第 4 项，详情跟着变；转成竖屏后换成竖版，选中状态保留。
import type { Case } from '../harness';
import { BagPanelView } from '../src/modules/bag/BagPanelView';
import { bagModel } from '../src/modules/bag/BagModel';

const c: Case = {
  screen: { width: 1280, height: 720 },
  async run(t) {
    await t.open(BagPanelView);
    await t.click('Bag/BagPanel.list[1]');
    await t.click('Bag/BagPanel.list[3]');
    await t.setScreen(720, 1280);
    await t.click('Bag/BagPanel.list[0]');
    return { selectedId: bagModel.get().selectedId };
  },
};
export default c;
