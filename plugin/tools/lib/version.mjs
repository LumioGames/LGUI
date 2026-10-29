// 插件和工程的版本检查：不一致就停下，提示运行 lgui upgrade。不做兼容处理。
import fs from 'node:fs';
import path from 'node:path';
import {pluginRoot} from './paths.mjs';
import {LgCliError} from './errors.mjs';

export function pluginVersion() {
  return JSON.parse(fs.readFileSync(path.join(pluginRoot, 'plugin.json'), 'utf8')).version;
}

// project 是 readProject 的结果。
export function assertSameVersion(project, plugin = pluginVersion()) {
  if (project.lguiVersion !== plugin) {
    throw new LgCliError('LGUI-CLI-003', `工程里的框架是 ${project.lguiVersion}，插件是 ${plugin}，请先运行 lgui upgrade。`, {
      fix: '运行 lgui upgrade。'
    });
  }
}
