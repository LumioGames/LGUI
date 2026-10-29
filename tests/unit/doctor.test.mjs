import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import {run, tempProject, emptyDir} from './cli/helpers.mjs';
import {checkNode, checkPlatform, checkBrowser} from '../../plugin/tools/lib/commands/doctor.mjs';
import {browserCandidates} from '../../plugin/tools/lib/browser.mjs';

test('Node 版本太低报 LGUI-CLI-070；24 及以上通过', () => {
  assert.deepEqual([checkNode('22.23.2').ok, checkNode('22.23.2').code], [false, 'LGUI-CLI-070']);
  assert.equal(checkNode('24.22.1').ok, true);
  assert.match(checkNode('25.0.0').detail, /推荐 24\.22\.1/);
});

test('找不到浏览器报 LGUI-CLI-073；各系统的候选位置照计划', () => {
  const none = checkBrowser({exists: () => false, which: () => null});
  assert.deepEqual([none.ok, none.code], [false, 'LGUI-CLI-073']);
  const mac = checkBrowser({platform: 'darwin', exists: f => f.includes('Microsoft Edge'), which: () => null});
  assert.match(mac.detail, /Microsoft Edge\.app/);
  assert.ok(browserCandidates('win32', {ProgramFiles: 'C:\\PF', LocalAppData: 'C:\\LA'}).some(p => p.endsWith(path.join('Google', 'Chrome', 'Application', 'chrome.exe'))));
  assert.deepEqual(browserCandidates('linux'), ['google-chrome', 'google-chrome-stable', 'chromium', 'microsoft-edge']);
  assert.deepEqual([checkPlatform('linux-arm64').ok, checkPlatform('linux-arm64').code], [false, 'LGUI-CLI-005']);
});

test('lgui doctor：本机环境全部通过；在工程里还查版本和端口；--paths 打印目录', async () => {
  const result = JSON.parse((await run(['doctor', '--json'], emptyDir())).stdout);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.data.items.map(i => i.name), ['Node', '平台', '随插件带的工具', '浏览器']);
  const root = tempProject({lguiVersion: '0.0.1', devPort: 0 + 1});
  const blocker = net.createServer();
  await new Promise(r => blocker.listen(0, '127.0.0.1', r));
  fs.writeFileSync(path.join(root, '.lgui/project.json'), JSON.stringify({name: 'demo', lguiVersion: '0.0.1', devPort: blocker.address().port}));
  const inProject = JSON.parse((await run(['doctor', '--json'], root)).stdout);
  blocker.close();
  assert.deepEqual(inProject.errors.map(e => e.code).sort(), ['LGUI-CLI-003', 'LGUI-CLI-074']);
  const paths = JSON.parse((await run(['doctor', '--paths', '--json'], os.tmpdir())).stdout);
  assert.ok(fs.existsSync(path.join(paths.data.references, 'ui-spec.md')));
});
