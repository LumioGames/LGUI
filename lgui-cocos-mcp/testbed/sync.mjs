// 包同步（dev 脚本，不进发布面）：把 LGUI 的产物灌进 testbed 的 Cocos 工程。
// 用法：node sync.mjs  ——每次 ui/、框架或工程配置变了都要跑。
// 灌四样：界面包（generateCocos → assets/lgui-ui/<包名>/）、翻译（<out>/i18n/<语言>.xml）、
// 框架副本（assets/lgui-framework/，同 examples 的 .lgui/framework）、启动配置（assets/scripts/lgui-config.ts，生成不手改）。
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const testbed = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(testbed, '..', '..');
const load = rel => import(pathToFileURL(path.join(repo, 'plugin', 'tools', 'lib', rel)));

const {generateCocos, generateProjectTypes, uiProjectPath} = await load('generate/index.mjs');
const {generateTranslations} = await load('generate/i18n.mjs');

const projectRoot = path.join(repo, 'examples', 'inventory');
const project = JSON.parse(fs.readFileSync(path.join(projectRoot, '.lgui', 'project.json'), 'utf8'));
const uiRoot = path.join(testbed, 'assets', 'lgui-ui');

const ui = await generateCocos(uiProjectPath(projectRoot), uiRoot);
console.log(`界面包：${ui.files.length} 个文件 → assets/lgui-ui/`);

const {model, deps} = await generateProjectTypes(projectRoot);
generateTranslations(projectRoot, model, project.languages, path.join(uiRoot, 'i18n'), project.defaultLanguage);
console.log(`翻译：${project.languages.join('、')} → assets/lgui-ui/i18n/`);

// CC 只编译 assets/ 下的文件：只拷 cocos 后端需要的部分（h5 的 vendor .js 会被 CC 当 CJS 报错）。
{
  const frameworkTarget = path.join(testbed, 'assets', 'lgui-framework');
  fs.rmSync(frameworkTarget, {recursive: true, force: true});
  for (const part of ['index.ts', 'env.d.ts', 'core', 'mvc', 'backends/cocos']) {
    fs.cpSync(path.join(repo, 'plugin', 'framework', part), path.join(frameworkTarget, part), {recursive: true});
  }
}
console.log('框架：assets/lgui-framework/');

const components = Object.fromEntries(model.packages.map(pkg => [pkg.name, pkg.components.map(component => component.name)]));
const config = {
  name: project.name,
  languages: project.languages,
  defaultLanguage: project.defaultLanguage,
  defaultFont: project.defaultFont,
  design: project.designSize.landscape,
  designPortrait: project.designSize.portrait
};
const generated = `// 由 sync.mjs 生成，不要手改。
export const config = ${JSON.stringify(config, null, 2)};
export const deps = ${JSON.stringify(deps, null, 2)};
export const components = ${JSON.stringify(components, null, 2)};
`;
fs.writeFileSync(path.join(testbed, 'assets', 'scripts', 'lgui-config.ts'), generated);
console.log('启动配置：assets/scripts/lgui-config.ts');
