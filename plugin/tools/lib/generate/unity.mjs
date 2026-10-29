// Unity 用的界面包：<包名>_fui.bytes 加图集，直接输出到 out（导出时再复制到 Unity 工程的 Assets/LGUI/Resources/UI/）。
import fs from 'node:fs';
import path from 'node:path';
import {openFairyGUI} from '../vendor.mjs';
import {readUiProject, quiet} from './read.mjs';

export async function generateUnity(fairyPath, out) {
  const {functions} = openFairyGUI();
  const document = await readUiProject(fairyPath);
  document.getRoot().setProjectType(0); // Unity
  fs.rmSync(out, {recursive: true, force: true});
  fs.mkdirSync(out, {recursive: true});
  const assets = path.join(path.dirname(fairyPath), 'assets');
  const {value, log} = await quiet(() => functions.publishNode({document, output: out, assetsPath: assets, compressed: false, fileExtension: 'bytes', codeGeneration: false, plugins: []}));
  return {out, files: value.files.map(file => file.path), log};
}
