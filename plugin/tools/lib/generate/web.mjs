// 网页用的界面包：每个包输出到 <out>/<包名>/，内含 package.xml（FairyGUI-dom 实际请求的文件名，内容是 Layabox 格式的二进制包）
// 和按资源 ID 命名的散图 <资源ID>.png；再写一份 <out>/manifest.json，网页运行时靠它找到散图。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openFairyGUI} from '../vendor.mjs';
import {LgCliError} from '../errors.mjs';
import {readUiProject, quiet} from './read.mjs';

export async function generateWeb(fairyPath, out) {
  const {functions} = openFairyGUI();
  const document = await readUiProject(fairyPath);
  document.getRoot().setProjectType(4); // Layabox
  const assets = path.join(path.dirname(fairyPath), 'assets');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-web-'));
  try {
    const {log} = await quiet(() => functions.publishNode({document, output: temp, assetsPath: assets, compressed: false, fileExtension: 'fui', codeGeneration: false, plugins: []}));
    fs.rmSync(out, {recursive: true, force: true});
    fs.mkdirSync(out, {recursive: true});
    const manifest = {schemaVersion: 1, packages: {}};
    const files = [];
    for (const pkg of document.getRoot().listPackages()) {
      const name = pkg.getName();
      const dir = path.join(out, name);
      fs.mkdirSync(dir, {recursive: true});
      const binary = path.join(temp, `${name}.fui`);
      if (!fs.existsSync(binary)) throw new LgCliError('LGUI-CLI-021', `OpenFairyGUI 没有生成包 ${name} 的 ${name}.fui。`, {fix: '这是生成步骤的缺陷，请把输出报告给维护者。'});
      fs.copyFileSync(binary, path.join(dir, 'package.xml'));
      files.push(path.join(dir, 'package.xml'));
      const images = {};
      for (const image of pkg.listImageResources()) {
        // 直接从 ui/assets/ 读图片字节（OpenFairyGUI 后端的 readResourceBytes 有 1 MiB 上限）。
        const source = path.join(assets, name, image.getPath().replace(/^\/+/, ''), image.getFileName());
        if (!fs.existsSync(source)) {
          throw new LgCliError('LGUI-CLI-021', `包 ${name} 的图片 ${image.getId()} 指向的文件不存在：${source}。`, {file: path.join(assets, name, 'package.xml'), fix: '把图片放回 package.xml 写的位置，或者从 package.xml 里删掉这条图片资源。'});
        }
        const file = `${image.getId()}${path.extname(image.getFileName()) || '.png'}`;
        fs.copyFileSync(source, path.join(dir, file));
        images[image.getId()] = file;
        files.push(path.join(dir, file));
      }
      manifest.packages[pkg.getId()] = {name, images};
    }
    fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    files.push(path.join(out, 'manifest.json'));
    return {out, files, manifest, log};
  } finally {
    fs.rmSync(temp, {recursive: true, force: true});
  }
}
