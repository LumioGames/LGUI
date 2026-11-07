// Cocos Creator 用的界面包：和 Unity 同一条 OpenFairyGUI 生成管线（setProjectType(0)，<包名>_fui.bytes + 图集），
// 但按 decisions/003 的布局输出：<out>/<包名>/<包名>_fui.bytes（图集跟着同目录），供 AssetManager bundle
// （目录 assets/lgui-ui 配置成 bundle）按 <包名> 加载。不是单独的命令；包同步（T007 起的 dev 脚本 / M2 的 MCP 工具）调用它。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openFairyGUI} from '../vendor.mjs';
import {LgCliError} from '../errors.mjs';
import {readUiProject, quiet} from './read.mjs';
import {prepareAtlas, atlasError} from './atlas.mjs';

export async function generateCocos(fairyPath, out) {
  const {functions} = openFairyGUI();
  const document = await readUiProject(fairyPath);
  document.getRoot().setProjectType(0); // 与 Unity 同一产物格式（标准 FairyGUI 二进制包）
  const assets = path.join(path.dirname(fairyPath), 'assets');
  await prepareAtlas(document, assets); // 图集上限：没写 maxAtlasSize 的包用 LGUI 的默认值，图比上限大就报 LGUI-CLI-113
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-cocos-'));
  try {
    const {log} = await quiet(() => functions.publishNode({document, output: temp, assetsPath: assets, compressed: false, fileExtension: 'bytes', codeGeneration: false, plugins: []})).catch(error => { throw atlasError(error); });
    const names = document.getRoot().listPackages().map(pkg => pkg.getName());
    fs.rmSync(out, {recursive: true, force: true});
    fs.mkdirSync(out, {recursive: true});
    const files = [];
    for (const name of names) {
      const dir = path.join(out, name);
      fs.mkdirSync(dir, {recursive: true});
      // 这个包的产物：二进制包 + 图集（<包名>_fui.bytes、<包名>_atlas0.png…）。带上图集的 .meta 兄弟文件不用管——OpenFairyGUI 不产它们。
      const produced = fs.readdirSync(temp).filter(file => file.startsWith(`${name}_`));
      if (!produced.some(file => file === `${name}_fui.bytes`)) {
        throw new LgCliError('LGUI-CLI-021', `OpenFairyGUI 没有生成包 ${name} 的 ${name}_fui.bytes。`, {fix: '这是生成步骤的缺陷，请把输出报告给维护者。'});
      }
      for (const file of produced) {
        fs.copyFileSync(path.join(temp, file), path.join(dir, file));
        files.push(path.join(dir, file));
      }
    }
    // 有不属于任何包的产物就停下：不悄悄丢文件，也不悄悄进错目录。
    const known = new Set(fs.readdirSync(temp).filter(file => names.some(name => file.startsWith(`${name}_`))));
    for (const file of fs.readdirSync(temp)) {
      if (!known.has(file)) throw new LgCliError('LGUI-CLI-021', `OpenFairyGUI 生成了不属于任何包的产物 ${file}。`, {fix: '这是生成步骤的缺陷，请把输出报告给维护者。'});
    }
    return {out, files, log};
  } finally {
    fs.rmSync(temp, {recursive: true, force: true});
  }
}
