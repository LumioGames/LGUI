// 随插件带的工具自检：依次试 5 个工具，任何一个失败都报出是哪个。
// 用法：node scripts/tools-smoke.mjs。没有 Chrome 也没有 Edge 时，浏览器那一项标「跳过」，不算失败。
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {typescript, esbuild, sharp, playwright, openFairyGUI} from '../plugin/tools/lib/vendor.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// 新建工程模板里的界面工程。
const templateUi = path.join(root, 'plugin/templates/project/project/UI.fairy');

export const checks = [
  ['TypeScript：转换一段代码', async () => {
    const out = typescript().transpileModule('const n: number = 1; export default n;', {compilerOptions: {module: 99, target: 7}}).outputText;
    if (!out.includes('const n = 1')) throw Error(`输出不对：${out}`);
  }],
  ['esbuild：转换一段 TS', async () => {
    const {code} = await esbuild().transform('let x: string = "a"; export {x};', {loader: 'ts'});
    if (!code.includes('let x = "a"')) throw Error(`输出不对：${code}`);
  }],
  ['sharp：把 2×2 的 PNG 缩放成 4×4', async () => {
    const s = sharp();
    const png = await s({create: {width: 2, height: 2, channels: 4, background: {r: 255, g: 0, b: 0, alpha: 1}}}).png().toBuffer();
    const meta = await s(await s(png).resize(4, 4).png().toBuffer()).metadata();
    if (meta.width !== 4 || meta.height !== 4) throw Error(`缩放后是 ${meta.width}×${meta.height}`);
  }],
  ['OpenFairyGUI：校验模板里的界面工程', async () => {
    const report = await openFairyGUI().functions.validateProjectNode(templateUi);
    if (report.status !== 'valid') throw Error(`校验结果 ${report.status}：${JSON.stringify(report.diagnostics)}`);
  }],
  ['playwright-core：用 Chrome 或 Edge 打开 about:blank', async () => {
    const {chromium} = playwright();
    for (const channel of ['chrome', 'msedge']) {
      let browser;
      try {
        browser = await chromium.launch({channel, headless: true});
      } catch {
        continue;
      }
      try {
        const page = await browser.newPage();
        await page.goto('about:blank');
        return `用的是 ${channel}`;
      } finally {
        await browser.close();
      }
    }
    return {skipped: '未找到 Chrome 或 Edge'};
  }]
];

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let failed = 0;
  for (const [name, run] of checks) {
    try {
      const result = await run();
      if (result?.skipped) console.log(`跳过  ${name}（${result.skipped}）`);
      else console.log(`通过  ${name}${typeof result === 'string' ? `（${result}）` : ''}`);
    } catch (error) {
      failed++;
      console.error(`失败  ${name}：${error.code ? error.code + ' ' : ''}${error.message}${error.fix ? `  → ${error.fix}` : ''}`);
    }
  }
  console.log(`${process.platform}-${process.arch}，Node ${process.version}：${checks.length - failed}/${checks.length} 项没有失败。`);
  if (failed) process.exit(1);
}
