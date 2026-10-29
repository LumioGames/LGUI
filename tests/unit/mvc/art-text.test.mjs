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
  const glyphs = () => damage.children[0].children.map(g => [g.url.replace('ui://Bag/', ''), g.rect.x, g.rect.y, g.rect.width]);
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

test('ArtText：每批字符归组件所有，替换、清空和关闭都销毁这一批；缺字保留原批次', async () => {
  const {fw, backend, FxView, model} = await setup('+120');
  const created = [];
  const createContainer = backend.createContainer.bind(backend);
  backend.createContainer = name => {
    const component = createContainer(name);
    created.push(component);
    return component;
  };
  const view = await fw.lgui.ui.open(FxView);
  const damage = view.__component.child('damage');
  const first = damage.children[0];
  assert.equal(first.kind, 'container', '原生字符图片必须归可销毁的组件所有');
  assert.equal(first.children.length, 4);
  assert.deepEqual(first.rect, {x: 0, y: 0, width: 200, height: 40});
  assert.equal(first.touchable, false);
  model.set({damage: '9'});
  assert.equal(first.disposed, true);
  assert.equal(first.children.length, 0);
  assert.equal(first.parent, null);
  assert.equal(damage.children.length, 1);
  const second = damage.children[0];
  model.set({damage: ''});
  assert.equal(second.disposed, true);
  assert.equal(damage.children.length, 0);
  const batchesBeforeEmpty = created.length;
  model.set({damage: ''});
  assert.equal(created.length, batchesBeforeEmpty, '空文字不创建空批次');
  model.set({damage: '12'});
  const last = damage.children[0];
  assert.throws(() => model.set({damage: 'x'}), {code: 'LGUI-RT-130'});
  assert.strictEqual(damage.children[0], last, '缺字必须在替换之前失败');
  assert.equal(last.disposed, false);
  fw.lgui.ui.close(FxView);
  assert.equal(last.disposed, true, '祖先界面关闭必须递归销毁最后一批');
});
