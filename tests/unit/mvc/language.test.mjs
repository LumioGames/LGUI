import test from 'node:test';
import assert from 'node:assert/strict';
import {started} from '../../helpers/framework.mjs';

test('换语言：带字的图片先找 @<语言> 版本，找不到用默认版本；界面重建但 onOpen 不重复调用、选中项保留', async () => {
  const {fw} = await started();
  const {lgui, View, ItemView, pick, setTexts} = fw;
  setTexts({'zh-CN': {}, en: {}}, 'zh-CN');
  let opened = 0;
  const bag = lgui.Model({items: [{id: 'a'}, {id: 'b'}, {id: 'c'}], selected: 'b'});
  class SlotView extends ItemView { static component = 'Bag/ItemSlot'; bind = {icon: {icon: () => 'ui://Bag/flag'}}; }
  class BagView extends View {
    static component = 'Bag/BagPanel'; static layer = 'page'; static fullScreen = true;
    bind = {list: {items: pick(bag, s => s.items), item: SlotView, key: it => it.id, selected: pick(bag, s => s.selected)}};
    onOpen() { opened++; }
  }
  const view = await lgui.ui.open(BagView);
  const icon = () => view.__component.child('list').itemAt(0).child('icon').url;
  assert.equal(icon(), 'ui://Bag/flag');
  const events = [];
  fw.bus.on(lgui.events.languageChange, e => events.push(e.language));
  const before = view.__component;
  await lgui.setLanguage('en');
  assert.notEqual(view.__component, before, '界面重建了');
  assert.deepEqual([icon(), view.__component.child('list').selectedIndex, opened, events, lgui.language()], ['ui://Bag/flag@en', 1, 1, ['en'], 'en']);
});
