import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {run, tempProject} from './cli/helpers.mjs';
import {changesBetween} from '../../plugin/tools/lib/commands/upgrade.mjs';
import {pluginVersion} from '../../plugin/tools/lib/version.mjs';

test('旧版本的工程：命令报 LGUI-CLI-003；lgui upgrade 之后就通过', async () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-upgrade-'));
  await run(['init', 'g'], parent);
  const root = path.join(parent, 'g');
  const file = path.join(root, '.lgui/project.json');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(`"lguiVersion": "${pluginVersion()}"`, '"lguiVersion": "0.2.9"'));
  fs.writeFileSync(path.join(root, '.lgui/framework/stale.ts'), '// 旧版本留下的文件\n');
  const before = JSON.parse((await run(['check', '--json'], root)).stdout);
  assert.equal(before.errors[0].code, 'LGUI-CLI-003');
  assert.match(before.errors[0].message, /工程里的框架是 0\.2\.9，插件是 .*，请先运行 lgui upgrade。/);
  const up = JSON.parse((await run(['upgrade', '--json'], root)).stdout);
  assert.equal(up.ok, true);
  assert.deepEqual([up.data.from, up.data.to], ['0.2.9', pluginVersion()]);
  assert.ok(up.data.changes.some(c => c.startsWith(`## ${pluginVersion()}`)), 'CHANGELOG 里跨过的版本');
  assert.equal(fs.existsSync(path.join(root, '.lgui/framework/stale.ts')), false, '整个替换');
  assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).name, 'g', '其他字段保留');
  const after = JSON.parse((await run(['check', '--json'], root)).stdout);
  assert.equal(after.ok, true, JSON.stringify(after.errors));
  const again = JSON.parse((await run(['upgrade', '--json'], root)).stdout);
  assert.equal(again.data.upgraded, false);
});

test('CHANGELOG：只取跨过的版本', () => {
  const log = '# 更新记录\n\n## 0.5.0\n\n- e\n\n## 0.4.0（未发布）\n\n- d\n\n## 0.3.0\n\n- c\n';
  assert.deepEqual(changesBetween(log, '0.3.0', '0.5.0').map(s => s.split('\n')[0]), ['## 0.5.0', '## 0.4.0（未发布）']);
});

for (const {label, manifest} of [
  {label: '旧版', manifest: {name: 'com.lumiogames.lgui', version: '0.2.9'}},
  {label: '缺少清单', manifest: null},
  {label: '名称错误', manifest: {name: 'com.example.unrelated', version: pluginVersion()}},
  {label: '清单 JSON 损坏', manifest: '{broken'}
]) {
  test(`框架已同版：Unity 包${label}时仍替换包，不重写框架或工程配置`, async () => {
    const root = tempProject({unityProject: 'unity'});
    const packageDir = path.join(root, 'unity/Packages/com.lumiogames.lgui');
    fs.mkdirSync(packageDir, {recursive: true});
    if (manifest) fs.writeFileSync(path.join(packageDir, 'package.json'), typeof manifest === 'string' ? manifest : JSON.stringify(manifest));
    fs.writeFileSync(path.join(packageDir, 'stale.txt'), '旧 Unity 包的文件');
    const marker = path.join(root, '.lgui/framework/local-marker.ts');
    fs.mkdirSync(path.dirname(marker), {recursive: true});
    fs.writeFileSync(marker, '// 同版框架不应被重新复制\n');
    const configFile = path.join(root, '.lgui/project.json');
    const beforeConfig = fs.readFileSync(configFile);
    const beforeMarker = fs.readFileSync(marker);

    const result = await run(['upgrade', '--json'], root);
    assert.equal(result.code, 0, result.stdout + result.stderr);
    const up = JSON.parse(result.stdout);
    assert.equal(up.data.upgraded, true);
    assert.deepEqual([up.data.from, up.data.to], [pluginVersion(), pluginVersion()]);
    assert.equal(up.data.unity, packageDir);
    assert.deepEqual(up.data.files, []);
    assert.equal(JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8')).version, pluginVersion());
    assert.equal(fs.existsSync(path.join(packageDir, 'Runtime/LGUIBoot.cs')), true);
    assert.equal(fs.existsSync(path.join(packageDir, 'stale.txt')), false);
    assert.deepEqual(fs.readFileSync(marker), beforeMarker);
    assert.deepEqual(fs.readFileSync(configFile), beforeConfig);
    assert.equal(JSON.parse((await run(['upgrade', '--json'], root)).stdout).data.upgraded, false);
  });
}

for (const linkedPart of ['Packages', 'package']) {
  test(`Unity ${linkedPart} 链接逃逸工程时拒绝升级，外部文件和链接保持不变`, async () => {
    const root = tempProject({unityProject: 'unity'});
    const unityRoot = path.join(root, 'unity');
    fs.mkdirSync(unityRoot);
    const external = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-upgrade-external-'));
    const externalPackage = linkedPart === 'Packages' ? path.join(external, 'com.lumiogames.lgui') : external;
    fs.mkdirSync(externalPackage, {recursive: true});
    const externalManifest = path.join(externalPackage, 'package.json');
    fs.writeFileSync(externalManifest, JSON.stringify({name: 'com.lumiogames.lgui', version: '0.2.9'}));
    const marker = path.join(externalPackage, 'external.txt');
    fs.writeFileSync(marker, '不能删除或覆盖的外部文件');
    const linked = linkedPart === 'Packages' ? path.join(unityRoot, 'Packages') : path.join(unityRoot, 'Packages/com.lumiogames.lgui');
    fs.mkdirSync(path.dirname(linked), {recursive: true});
    fs.symlinkSync(external, linked, 'junction');
    const beforeConfig = fs.readFileSync(path.join(root, '.lgui/project.json'));
    const beforeManifest = fs.readFileSync(externalManifest);
    const beforeMarker = fs.readFileSync(marker);

    const result = await run(['upgrade', '--json'], root);
    const up = JSON.parse(result.stdout);
    assert.equal(result.code, 1, result.stdout);
    assert.equal(up.errors[0].code, 'LGUI-CLI-004');
    assert.match(up.errors[0].message, /链接|Packages|范围/);
    assert.equal(fs.lstatSync(linked).isSymbolicLink(), true);
    assert.deepEqual(fs.readFileSync(path.join(root, '.lgui/project.json')), beforeConfig);
    assert.deepEqual(fs.readFileSync(externalManifest), beforeManifest);
    assert.deepEqual(fs.readFileSync(marker), beforeMarker);
  });
}

test('框架升级时，配置的 Unity 工程不存在仍提示未替换，不新建 Unity 工程', async () => {
  const root = tempProject({lguiVersion: '0.2.9', unityProject: 'missing-unity'});
  const result = await run(['upgrade'], root);
  assert.equal(result.code, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /不存在，没有替换 Unity 包/);
  assert.equal(fs.existsSync(path.join(root, 'missing-unity')), false);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, '.lgui/project.json'), 'utf8')).lguiVersion, pluginVersion());
});
