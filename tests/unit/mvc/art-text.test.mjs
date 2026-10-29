import test from 'node:test';
import assert from 'node:assert/strict';
import {started} from '../../helpers/framework.mjs';

async function setup(text) {
  const ctx = await started();
  const {lgui, View, pick} = ctx.fw;
  const model = lgui.Model({damage: text});
  class FxView extends View { static component = 'Bag/Fx'; static layer = 'popup'; bind = {damage: {text: pick(model, s => s.damage)}}; }
  return {...ctx, FxView, model};
}

test('ArtText：按字符找图片逐个摆出来，居中，字间距 2；文字变了重新拼', async () => {
  const {fw, FxView, model} = await setup('+120');
  const view = await fw.lgui.ui.open(FxView);
  const damage = view.__component.child('damage');
  const glyphs = () => damage.children.map(g => [g.url.replace('ui://Bag/', ''), g.rect.x, g.rect.y, g.rect.width]);
  // 宽度 10 + 8 + 12 + 12 + 间距 2×3 = 48，框宽 200 → 从 76 开始
  assert.deepEqual(glyphs(), [['dmg_plus', 76, 12, 10], ['dmg_1', 88, 12, 8], ['dmg_2', 98, 12, 12], ['dmg_0', 112, 12, 12]]);
  model.set({damage: '9'});
  assert.deepEqual(glyphs(), [['dmg_9', 94, 12, 12]]);
});

test('ArtText：缺某个字符的图片时报 LGUI-RT-130 并指出是哪个字符；配置写错报 LGUI-UI-013', async () => {
  const {fw, FxView} = await setup('12x');
  await assert.rejects(fw.lgui.ui.open(FxView), e => e.code === 'LGUI-RT-080' && /LGUI-RT-130/.test(e.message) && /缺字符「x」/.test(e.message));
  const {View} = fw;
  class Bad extends View { static component = 'Bag/Fx'; static layer = 'popup'; bind = {bad: {text: '1'}}; }
  await assert.rejects(fw.lgui.ui.open(Bad), e => /LGUI-UI-013/.test(e.message));
});
