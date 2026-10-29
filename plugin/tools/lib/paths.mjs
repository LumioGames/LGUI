// 插件目录和工程目录。
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {LgCliError} from './errors.mjs';

// 插件根目录（plugin/），从本文件的位置推出来。
export const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const referencesDir = path.join(pluginRoot, 'references');
export const editorDir = path.join(pluginRoot, 'editor');
export const templatesDir = path.join(pluginRoot, 'templates');
export const frameworkDir = path.join(pluginRoot, 'framework');

// 从 start 往上找 .lgui/project.json，返回工程根目录；找不到报 LGUI-CLI-002。
export function findProjectRoot(start = process.cwd()) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.lgui', 'project.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new LgCliError('LGUI-CLI-002', `从 ${path.resolve(start)} 往上都没有找到 .lgui/project.json，这里不在 LGUI 工程里。`, {
        fix: '先运行 lgui init 建工程，或者 cd 到工程目录里再运行。'
      });
    }
    dir = parent;
  }
}
