// lgui upgrade：把插件里的新版框架复制进工程（整个替换 .lgui/framework/），配了 Unity 工程时同样替换 Unity 包，
// 再打印 CHANGELOG 里跨过的那几个版本，提醒按它改代码。
import fs from 'node:fs';
import path from 'node:path';
import {pluginRoot, frameworkDir} from '../paths.mjs';
import {pluginVersion} from '../version.mjs';
import {copyFramework, frameworkParts} from './init.mjs';
import {LgCliError} from '../errors.mjs';

const listFiles = dir => !fs.existsSync(dir) ? [] : fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.isDirectory() ? listFiles(path.join(dir, e.name)).map(f => path.join(e.name, f)) : [e.name]);

// 语义化版本比较：a > b 返回正数。
const compare = (a, b) => {
  const pa = a.split(/[.-]/).map(Number), pb = b.split(/[.-]/).map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  return 0;
};

/** CHANGELOG 里版本号在 (from, to] 之间的段落。 */
export function changesBetween(changelog, from, to) {
  const sections = changelog.split(/^## /m).slice(1).map(text => ({version: text.split(/[\s（(]/)[0], text: '## ' + text.trim()}));
  return sections.filter(s => /^\d+\.\d+\.\d+/.test(s.version) && compare(s.version, from) > 0 && compare(s.version, to) <= 0).map(s => s.text);
}

// 替换前确认 Packages 和包目录的实际位置；不沿目录链接删除或写入工程外的文件。
function assertUnityPackagePath(unityRoot, packageDir) {
  const fail = (file, message) => new LgCliError('LGUI-CLI-004', `Unity 包路径 ${file} ${message}`, {
    file, fix: '检查 unityProject 和目录链接；Unity 包必须放在这个工程的 Packages/com.lumiogames.lgui 内。'
  });
  const realRoot = fs.realpathSync(unityRoot);
  if (!fs.statSync(realRoot).isDirectory()) throw fail(unityRoot, '不是目录，不能替换 Unity 包。');
  const packagesDir = path.dirname(packageDir);
  const allowed = path.join(realRoot, 'Packages');
  for (const file of [packagesDir, packageDir]) {
    if (!fs.lstatSync(file, {throwIfNoEntry: false})) continue;
    let real;
    try { real = fs.realpathSync(file); }
    catch (error) { throw fail(file, `无法确认实际位置：${error.message}`); }
    const relative = path.relative(allowed, real);
    const inside = relative === '' ? file === packagesDir :
      relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
    if (!inside) throw fail(file, '通过目录链接超出了工程的 Packages 范围，不能替换。');
    if (!fs.statSync(real).isDirectory()) throw fail(file, '不是目录，不能替换 Unity 包。');
  }
}

export async function upgrade({projectRoot, project}) {
  const to = pluginVersion();
  const from = project.lguiVersion;
  const frameworkChanged = from !== to;
  const unityRoot = project.unityProject ? path.resolve(projectRoot, project.unityProject) : null;
  const packageDir = unityRoot ? path.join(unityRoot, 'Packages', 'com.lumiogames.lgui') : null;
  const manifest = packageDir ? path.join(packageDir, 'package.json') : null;
  if (unityRoot && fs.existsSync(unityRoot)) assertUnityPackagePath(unityRoot, packageDir);
  let unityChanged = false;
  if (!frameworkChanged && unityRoot && fs.existsSync(unityRoot)) {
    let installed = null;
    if (fs.existsSync(manifest)) {
      const text = fs.readFileSync(manifest, 'utf8');
      try { installed = JSON.parse(text); }
      catch (error) { if (!(error instanceof SyntaxError)) throw error; }
    }
    unityChanged = installed?.name !== 'com.lumiogames.lgui' || installed?.version !== to;
  }
  if (!frameworkChanged && !unityChanged) return {data: {from, to, upgraded: false}, summary: [`工程已经是插件的版本 ${to}，不用升级。`]};
  let files = [];
  const summary = [];
  if (frameworkChanged) {
    const target = path.join(projectRoot, '.lgui', 'framework');
    files = frameworkParts.flatMap(part => fs.statSync(path.join(frameworkDir, part)).isDirectory() ? listFiles(path.join(frameworkDir, part)).map(f => path.join(part, f)) : [part]);
    copyFramework(target);
    // 只改 lguiVersion，其余字段原样保留；只更新 Unity 包时不重写配置。
    const file = path.join(projectRoot, '.lgui', 'project.json');
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    raw.lguiVersion = to;
    fs.writeFileSync(file, JSON.stringify(raw, null, 2) + '\n');
    summary.push(`已把工程从 LGUI ${from} 升级到 ${to}：替换了 .lgui/framework/（${files.length} 个文件）。`);
  }
  let unity = null;
  if (unityRoot) {
    if (fs.existsSync(unityRoot)) {
      fs.rmSync(packageDir, {recursive: true, force: true});
      fs.cpSync(path.join(frameworkDir, 'backends', 'unity', 'package'), packageDir, {recursive: true});
      unity = packageDir;
      summary.push(`已替换 Unity 工程里的 ${path.relative(projectRoot, packageDir)}。`);
    } else {
      summary.push(`工程配置的 Unity 工程 ${project.unityProject} 不存在，没有替换 Unity 包；下次 lgui unity export 时会装上。`);
    }
  }
  const changelog = fs.existsSync(path.join(pluginRoot, 'CHANGELOG.md')) ? fs.readFileSync(path.join(pluginRoot, 'CHANGELOG.md'), 'utf8') : '';
  const changes = changesBetween(changelog, from, to);
  if (frameworkChanged) summary.push('这次跨过的版本改了这些（按它改代码，然后运行 lgui check 和 lgui test）：', ...(changes.length ? changes : ['（CHANGELOG 里没有这几个版本的记录）']));
  return {data: {from, to, upgraded: true, files, unity, changes}, summary};
}
