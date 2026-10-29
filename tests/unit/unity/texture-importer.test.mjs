import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repo = fileURLToPath(new URL('../../..', import.meta.url));
const editor = path.join(repo, 'plugin/framework/backends/unity/package/Editor');

test('Unity 图集导入规则随包分发且只进入 Editor 程序集', () => {
  const assembly = path.join(editor, 'LGUI.Editor.asmdef');
  assert.ok(fs.existsSync(assembly), '真实Player已证实图集含mipmap；Unity包必须提供Editor导入规则');
  const value = JSON.parse(fs.readFileSync(assembly, 'utf8'));
  assert.equal(value.name, 'LGUI.Editor');
  assert.deepEqual(value.includePlatforms, ['Editor']);
  assert.deepEqual(value.references, []);
  for (const name of ['LGUI.Editor.asmdef', 'LGUIAtlasTextureImporter.cs']) {
    assert.match(fs.readFileSync(path.join(editor, name + '.meta'), 'utf8'), /^guid: [a-f0-9]{32}$/m);
  }
});

test('图集规则只改有对应生成包的 LGUI 图集 mipmap；其他纹理设置没有证据就不更改', () => {
  const file = path.join(editor, 'LGUIAtlasTextureImporter.cs');
  assert.ok(fs.existsSync(file), '需要实际TextureImporter规则，不能屏蔽FairyGUI运行警告');
  const source = fs.readFileSync(file, 'utf8');
  assert.match(source, /:\s*AssetPostprocessor/);
  assert.match(source, /void OnPreprocessTexture\(\)/);
  assert.match(source, /mipmapEnabled\s*=\s*false/);
  assert.match(source, /File\.Exists\(/, '同目录必须存在对应的_fui.bytes，避免误改同名用户图片');
  assert.match(source, /_fui\.bytes/);
  assert.doesNotMatch(source, /\.textureCompression\s*=|\.alphaIsTransparency\s*=|\.textureType\s*=|\.filterMode\s*=|\.wrapMode\s*=|\.maxTextureSize\s*=|\.npotScale\s*=/);
  const pattern = /new Regex\(@"([^"]+)"/.exec(source)?.[1];
  assert.ok(pattern, '范围使用可核对的完整路径正则；真实导入行为由NativeProbe验证');
  const matcher = new RegExp(pattern);
  for (const asset of ['Assets/LGUI/Resources/UI/Main_atlas0.png', 'Assets/LGUI/Resources/UI/My_Package_atlas12.png']) assert.ok(matcher.test(asset), asset);
  for (const asset of ['Assets/User/Logo.png', 'Assets/LGUI/Resources/UI/Main.png', 'Assets/LGUI/Resources/UI/Custom_atlasNote.png', 'Assets/LGUI/Resources/UI/Nested/Main_atlas0.png', 'Assets/Other/Resources/UI/Main_atlas0.png', 'Packages/com.example/UI/Main_atlas0.png']) assert.equal(matcher.test(asset), false, asset);
});
