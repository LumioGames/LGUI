// lgui doctor：逐项检查环境，每项给出「通过 / 失败 + 怎么修」。--paths 打印插件、规范、编辑器所在的目录。
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import {LgCliError} from '../errors.mjs';
import {findBrowser} from '../browser.mjs';
import {currentPlatform, supportedPlatforms, typescript, esbuild, sharp, playwright, openFairyGUI} from '../vendor.mjs';
import {pluginRoot, referencesDir, editorDir, templatesDir} from '../paths.mjs';
import {readProject} from '../project.mjs';
import {pluginVersion} from '../version.mjs';

const RECOMMENDED_NODE = '24.22.1';

/** Node 版本要 24 或更高。 */
export function checkNode(version = process.versions.node) {
  const major = Number(version.split('.')[0]);
  if (major >= 24) return {ok: true, detail: `Node ${version}${version === RECOMMENDED_NODE ? '' : `（推荐 ${RECOMMENDED_NODE}）`}`};
  return {ok: false, code: 'LGUI-CLI-070', detail: `Node ${version} 太旧，LGUI 要求 24 或更高。`, fix: `安装 Node 24（推荐 ${RECOMMENDED_NODE}），装好后重新打开终端。`};
}

/** 当前平台是不是 4 个支持平台之一。 */
export function checkPlatform(platform = currentPlatform()) {
  if (supportedPlatforms.includes(platform)) return {ok: true, detail: platform};
  return {ok: false, code: 'LGUI-CLI-005', detail: `${platform} 不受支持。`, fix: `换到 ${supportedPlatforms.join('、')} 之一。`};
}

/** 5 个随插件带的工具都能加载（不打开浏览器）。 */
export async function checkTools() {
  const failures = [];
  const tryLoad = async (name, run) => { try { await run(); } catch (error) { failures.push(`${name}：${error.message}`); } };
  await tryLoad('TypeScript', () => { if (!typescript().transpileModule('let a: number = 1', {}).outputText.includes('a = 1')) throw Error('转换结果不对'); });
  await tryLoad('esbuild', async () => { await esbuild().transform('let a: number = 1', {loader: 'ts'}); });
  await tryLoad('sharp', async () => { await sharp()({create: {width: 1, height: 1, channels: 3, background: '#000'}}).png().toBuffer(); });
  await tryLoad('OpenFairyGUI', async () => { const r = await openFairyGUI().functions.validateProjectNode(path.join(templatesDir, 'project', 'ui', 'UI.fairy')); if (r.status !== 'valid') throw Error(`模板校验结果 ${r.status}`); });
  await tryLoad('playwright-core', () => { if (typeof playwright().chromium?.launch !== 'function') throw Error('没有 chromium.launch'); });
  if (!failures.length) return {ok: true, detail: 'TypeScript、esbuild、sharp、OpenFairyGUI、playwright-core 都能加载'};
  return {ok: false, code: 'LGUI-CLI-072', detail: `这些工具加载失败：${failures.join('；')}`, fix: '插件不完整，重新安装 LGUI 插件。'};
}

/** 找得到 Chrome 或 Edge。 */
export function checkBrowser(options) {
  const found = findBrowser(options);
  if (found) return {ok: true, detail: found};
  return {ok: false, code: 'LGUI-CLI-073', detail: '没找到 Chrome 或 Edge。', fix: '装一个 Chrome 或 Edge（lgui dev 预览、lgui verify 截图都要用）。'};
}

const portFree = port => new Promise(resolve => {
  const server = net.createServer().once('error', () => resolve(false)).once('listening', () => server.close(() => resolve(true)));
  server.listen(port, '127.0.0.1');
});

/** 在工程里时：版本一致、devPort 没被占用。 */
export async function checkProject(cwd) {
  let dir = path.resolve(cwd);
  while (!fs.existsSync(path.join(dir, '.lgui', 'project.json'))) {
    const parent = path.dirname(dir);
    if (parent === dir) return [];
    dir = parent;
  }
  const items = [];
  let project;
  try {
    project = readProject(dir);
  } catch (error) {
    return [{name: '工程配置', ok: false, code: 'LGUI-CLI-004', detail: (error.errors ?? [error]).map(e => e.message).join('；'), fix: '按 references/project-layout.md 的字段表改 .lgui/project.json。'}];
  }
  const plugin = pluginVersion();
  items.push(project.lguiVersion === plugin
    ? {name: '工程版本', ok: true, detail: `${project.name}：LGUI ${plugin}`}
    : {name: '工程版本', ok: false, code: 'LGUI-CLI-003', detail: `工程里的框架是 ${project.lguiVersion}，插件是 ${plugin}。`, fix: '运行 lgui upgrade。'});
  items.push(await portFree(project.devPort)
    ? {name: '预览端口', ok: true, detail: `${project.devPort} 空闲`}
    : {name: '预览端口', ok: false, code: 'LGUI-CLI-074', detail: `devPort ${project.devPort} 被占用了。`, fix: '在 .lgui/project.json 里改 devPort，或者 lgui dev --port <端口>。'});
  return items;
}

export async function doctor({flags, cwd}) {
  if (flags.paths) {
    const paths = {plugin: pluginRoot, references: referencesDir, editor: editorDir};
    return {data: paths, summary: [`插件目录：${paths.plugin}`, `规范目录（references）：${paths.references}`, `编辑器目录：${paths.editor}`]};
  }
  const items = [
    {name: 'Node', ...checkNode()},
    {name: '平台', ...checkPlatform()},
    {name: '随插件带的工具', ...(await checkTools())},
    {name: '浏览器', ...checkBrowser()},
    ...(await checkProject(cwd))
  ];
  const summary = items.map(i => `${i.ok ? '通过' : '失败'}  ${i.name}：${i.detail}${i.ok ? '' : `  → ${i.fix}`}`);
  return {
    data: {items},
    summary,
    errors: items.filter(i => !i.ok).map(i => new LgCliError(i.code, `${i.name}：${i.detail}`, {fix: i.fix}))
  };
}
