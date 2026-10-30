// lgui check 认得动效名当键（playing / play / done）和拖放的词（dragData / dragIcon / drop）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run} from '../unit/cli/helpers.mjs';

const VIEW = 'src/modules/main/MainView.ts';
const pulse = name => `  <transition name="${name}">\n    <item time="0" type="Alpha" target="n1" tween="true" startValue="1" endValue="0.5" duration="12"/>\n  </transition>\n</component>`;

async function project({transition = 'pulse', bind}) {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-check-'));
  assert.equal((await run(['init', 'g'], parent)).code, 0);
  const root = path.join(parent, 'g');
  for (const file of ['MainView.xml', 'MainView@portrait.xml']) {
    const full = path.join(root, 'ui/assets/Main', file);
    fs.writeFileSync(full, fs.readFileSync(full, 'utf8').replace(/<\/component>\s*$/, pulse(transition) + '\n'));
  }
  const view = path.join(root, VIEW);
  fs.writeFileSync(view, fs.readFileSync(view, 'utf8').replace('    button: { click: () => mainController.click() },', bind));
  const json = JSON.parse((await run(['check', '--json'], root)).stdout);
  return json.data ? json.data.findings.map(f => f.code) : json.errors.map(e => e.code);
}

test('动效和拖放的词写对了：没有错误', async () => {
  const codes = await project({bind: [
    '    pulse: { play: pick(mainModel, s => s.clicks), done: () => mainController.click() },',
    '    button: { click: () => mainController.click(), dragData: pick(mainModel, s => s.clicks), dragIcon: \'ui://Common/placeholder\', drop: (n: number) => mainController.click() },'
  ].join('\n')});
  assert.deepEqual(codes, []);
});

test('动效上写了别的词 → LGUI-MVC-006；控件上写 playing → LGUI-MVC-006；动效和控件重名 → LGUI-UI-005', async () => {
  assert.ok((await project({bind: '    pulse: { visible: true },\n    button: { click: () => mainController.click() },'})).includes('LGUI-MVC-006'));
  assert.ok((await project({bind: '    button: { click: () => mainController.click(), playing: true },'})).includes('LGUI-MVC-006'));
  assert.ok((await project({transition: 'status', bind: '    button: { click: () => mainController.click() },'})).includes('LGUI-UI-005'));
});
