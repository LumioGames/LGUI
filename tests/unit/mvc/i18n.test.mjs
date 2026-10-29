import test from 'node:test';
import assert from 'node:assert/strict';
import {headless} from '../../helpers/framework.mjs';

const tables = {
  'zh-CN': {'bag.sold': '已售出 {count} 件', 'bag.items': {other: '{count} 个道具'}, 'hi': '你好，{name}'},
  en: {'bag.sold': 'Sold {count}', 'bag.items': {one: '{count} item', other: '{count} items'}, 'hi': 'Hi, {name}'}
};

async function withIntl(present, run) {
  const saved = globalThis.Intl;
  if (!present) globalThis.Intl = undefined;
  try { return await run(); } finally { globalThis.Intl = saved; }
}

test('lgui.t：占位符；复数用 Intl.PluralRules', async () => {
  const {fw} = await headless();
  const {lgui, setTexts} = fw;
  setTexts(tables, 'zh-CN');
  assert.equal(lgui.t('bag.sold', {count: 3}), '已售出 3 件');
  assert.equal(lgui.t('hi', {name: '阿明'}), '你好，阿明');
  assert.equal(lgui.t('hi'), '你好，{name}', '没给的参数原样保留');
  assert.equal(lgui.t('bag.items', {count: 1}), '1 个道具');
  setTexts(tables, 'en');
  assert.deepEqual([lgui.t('bag.items', {count: 1}), lgui.t('bag.items', {count: 5}), lgui.language()], ['1 item', '5 items', 'en']);
});

test('没有 Intl 时的退路：复数用内置规则，格式化用内置实现', async () => {
  const {fw} = await headless();
  const {lgui, format, setTexts} = fw;
  await withIntl(false, () => {
    setTexts(tables, 'en');
    assert.deepEqual([lgui.t('bag.items', {count: 1}), lgui.t('bag.items', {count: 2})], ['1 item', '2 items']);
    setTexts(tables, 'zh-CN');
    assert.equal(lgui.t('bag.items', {count: 1}), '1 个道具');
    assert.equal(format.number(1234567.5), '1,234,567.5');
    assert.equal(format.number(-1000), '-1,000');
    assert.match(format.date(new Date(2026, 9, 29, 8, 5)), /^2026-10-29 08:05$/);
    assert.equal(format.currency(1234.5, 'CNY'), 'CNY 1,234.5');
  });
  await withIntl(true, () => {
    setTexts(tables, 'en');
    assert.equal(format.number(1234567), '1,234,567');
    assert.equal(format.currency(12, 'USD'), '$12.00');
  });
});

test('找不到键：显示键名，记一条 LGUI-RT-090（同一个键只记一次）', async () => {
  const {fw, backend} = await headless();
  const {lgui, setTexts} = fw;
  setTexts(tables, 'en');
  assert.equal(lgui.t('nope.key'), 'nope.key');
  lgui.t('nope.key');
  const errors = backend.state.logs.filter(l => /LGUI-RT-090/.test(l.message));
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /i18n\/en\.json/);
});

test('启动时选语言：系统语言里第一个工程支持的，都不支持就用默认语言', async () => {
  const {fw} = await headless();
  const {pickLanguage} = fw;
  assert.equal(pickLanguage(['en-US', 'zh-CN'], ['zh-CN', 'en'], 'zh-CN'), 'en');
  assert.equal(pickLanguage(['fr-FR'], ['zh-CN', 'en'], 'zh-CN'), 'zh-CN');
  assert.equal(pickLanguage(['zh-TW'], ['zh-CN', 'en'], 'en'), 'zh-CN');
});
