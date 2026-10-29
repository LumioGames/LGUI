import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {main} from '../../../plugin/tools/lib/cli.mjs';
import {pluginVersion} from '../../../plugin/tools/lib/version.mjs';

// 跑一条命令，收集输出。
export async function run(argv, cwd) {
  const out = [];
  const err = [];
  const code = await main(argv, {cwd, stdout: {write: text => out.push(text)}, stderr: {write: text => err.push(text)}});
  return {code, stdout: out.join(''), stderr: err.join('')};
}

// 建一个只有 .lgui/project.json 的临时工程。
export function tempProject(overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-cli-'));
  fs.mkdirSync(path.join(root, '.lgui'));
  fs.writeFileSync(path.join(root, '.lgui', 'project.json'), JSON.stringify({name: 'demo', lguiVersion: pluginVersion(), ...overrides}));
  return root;
}

export const emptyDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-cli-empty-'));
