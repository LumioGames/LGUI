// lgui test：找出 tests/**/*.test.ts，每个文件用 esbuild 打包（Node 平台、headless 后端），用 node --test 跑，汇总结果。
// 失败时附上那个测试结束时的 lgui.debug.snapshot()。
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {LgCliError} from '../errors.mjs';
import {esbuild} from '../vendor.mjs';
import {generateProjectTypes, headlessDir} from '../generate/index.mjs';
import {bundleErrors, frameworkEntry, readTexts, runtimeConfig} from '../dev/bundle.mjs';
import {readUiModel} from '../generate/model.mjs';
import {extractTexts, translationMaps} from '../generate/i18n.mjs';
import {uiProjectPath} from '../generate/index.mjs';

function findTests(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return findTests(full);
    return entry.name.endsWith('.test.ts') ? [full] : [];
  });
}

// 测试环境：headless 后端、模拟操作、界面描述、包依赖、配置和文本表。每个测试结束后记下快照。
function writeEnv(root, project, out) {
  const fw = rel => JSON.stringify(path.join(root, '.lgui', 'framework', rel).split(path.sep).join('/'));
  const packages = fs.readdirSync(headlessDir(root)).map(file => JSON.parse(fs.readFileSync(path.join(headlessDir(root), file), 'utf8')));
  const deps = JSON.parse(fs.readFileSync(path.join(root, '.lgui', 'build', 'deps.json'), 'utf8'));
  const texts = readTexts(root, project.languages);
  const translations = translationMaps(extractTexts(readUiModel(uiProjectPath(root))), texts);
  const file = path.join(out, 'env.ts');
  fs.writeFileSync(file, `// 由 lgui test 生成，不要手改。
import {afterEach} from 'node:test';
import {writeFileSync} from 'node:fs';
import {createHeadlessBackend} from ${fw('backends/headless/index.ts')};
import * as sim from ${fw('backends/headless/simulate.ts')};

const packages = ${JSON.stringify(packages)};
const env = {
  createBackend: () => createHeadlessBackend(packages, ${JSON.stringify(translations)}),
  sim,
  deps: ${JSON.stringify(deps)},
  config: ${JSON.stringify(runtimeConfig(project))},
  texts: ${JSON.stringify(texts)},
  current: null as null | {snapshot(): unknown}
};
(globalThis as unknown as {__lguiTest: typeof env}).__lguiTest = env;

const snapshots: Record<string, unknown> = {};
afterEach(t => {
  try { if (env.current) snapshots[t.name] = env.current.snapshot(); } catch (error) { snapshots[t.name] = String(error); }
  env.current = null;
});
// 每个测试文件在自己的进程里跑，各写一份快照，lgui test 跑完再合并。
process.on('exit', () => { if (process.env.LGUI_TEST_SNAPSHOTS) writeFileSync(process.env.LGUI_TEST_SNAPSHOTS + '/snapshots-' + process.pid + '.json', JSON.stringify(snapshots)); });
`);
  return file;
}

// 从 TAP 输出里读出每个测试的结果。
function parseTap(text) {
  const results = [];
  for (const line of text.split('\n')) {
    const m = /^\s*(not ok|ok) \d+ - (.*?)(?: # (SKIP|TODO).*)?$/.exec(line);
    if (m && !/\.mjs$/.test(m[2])) results.push({name: m[2], ok: m[1] === 'ok', skipped: Boolean(m[3])});
  }
  return results;
}

/** 打包并运行工程里的测试，返回 { files, results, snapshots, output }。 */
export async function runProjectTests(root, project) {
  const files = findTests(path.join(root, 'tests'));
  if (!files.length) throw new LgCliError('LGUI-CLI-040', 'tests/ 里没有测试文件（*.test.ts）。', {fix: '在 tests/ 下写测试，写法见 references/mvc-spec.md 第 12 节；lgui new module 会生成测试骨架。'});
  await generateProjectTypes(root);
  const out = path.join(root, '.lgui', 'build', 'test');
  fs.rmSync(out, {recursive: true, force: true});
  fs.mkdirSync(out, {recursive: true});
  const env = writeEnv(root, project, out);
  const bundles = [];
  for (const file of files) {
    const name = path.relative(path.join(root, 'tests'), file).replace(/\.ts$/, '.mjs').split(path.sep).join('__');
    const outfile = path.join(out, name);
    try {
      await esbuild().build({
        entryPoints: [file], bundle: true, platform: 'node', format: 'esm', target: 'es2020', outfile,
        alias: {lgui: frameworkEntry(root)}, inject: [env], define: {LGUI_DEV: 'true'}, keepNames: true, absWorkingDir: root, logLevel: 'silent', sourcemap: 'inline'
      });
    } catch (error) {
      throw bundleErrors(error, root);
    }
    bundles.push(outfile);
  }
  const snapshotDir = path.join(out, 'snapshots');
  fs.mkdirSync(snapshotDir);
  // lgui test 本身被别的测试工具调用时（比如在 node --test 里），去掉 NODE_TEST_CONTEXT，否则子进程会把结果报给外层而不是输出 TAP。
  const childEnv = {...process.env, LGUI_TEST_SNAPSHOTS: snapshotDir};
  delete childEnv.NODE_TEST_CONTEXT;
  const tap = spawnSync(process.execPath, ['--enable-source-maps', '--test', '--test-reporter=tap', '--test-concurrency=1', ...bundles], {
    cwd: root, encoding: 'utf8', env: childEnv, maxBuffer: 64 * 1024 * 1024
  });
  const output = tap.stdout + tap.stderr;
  const results = parseTap(tap.stdout);
  const snapshots = Object.assign({}, ...fs.readdirSync(snapshotDir).map(f => JSON.parse(fs.readFileSync(path.join(snapshotDir, f), 'utf8'))));
  return {files, results, snapshots, output};
}

/** lgui test 命令。 */
export async function test({projectRoot, project}) {
  const {files, results, snapshots, output} = await runProjectTests(projectRoot, project);
  const passed = results.filter(r => r.ok && !r.skipped).length;
  const failed = results.filter(r => !r.ok);
  const summary = [`跑了 ${files.length} 个测试文件、${results.length} 个测试：通过 ${passed}，失败 ${failed.length}。`];
  for (const r of failed) summary.push(`失败：${r.name}`);
  const errors = failed.map(r => new LgCliError('LGUI-CLI-041', `测试没通过：${r.name}。测试结束时的界面状态：${JSON.stringify(snapshots[r.name] ?? null)}`, {fix: '看上面的测试输出，按断言改代码或测试。'}));
  if (failed.length) summary.unshift(output.trim());
  return {data: {files: files.map(f => path.relative(projectRoot, f)), passed, failed: failed.map(r => ({name: r.name, snapshot: snapshots[r.name] ?? null})), results}, summary, errors};
}
