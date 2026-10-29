// 从 ui/ 生成网页和 Unity 用的界面包。不是单独的命令，由 lgui dev、verify、test、unity export 调用。每次都全部重新生成。
import fs from 'node:fs';
import path from 'node:path';
import {generateWeb} from './web.mjs';
import {generateUnity} from './unity.mjs';
import {readUiProject} from './read.mjs';
import {readUiModel} from './model.mjs';
import {generateTypes} from './types.mjs';
import {generateHeadless} from './headless.mjs';

export {generateWeb, generateUnity, readUiModel, generateTypes, generateHeadless};

// 工程里的固定位置：ui/UI.fairy → .lgui/build/web/ui/、.lgui/build/unity/ui/。
export const uiProjectPath = root => path.join(root, 'ui', 'UI.fairy');
export const webUiDir = root => path.join(root, '.lgui', 'build', 'web', 'ui');
export const unityUiDir = root => path.join(root, '.lgui', 'build', 'unity', 'ui');
export const typesDir = root => path.join(root, '.lgui', 'build', 'types');
export const headlessDir = root => path.join(root, '.lgui', 'build', 'headless');

// 控件类型和 headless 描述（先用 OpenFairyGUI 校验 ui/）。
export async function generateProjectTypes(root) {
  await readUiProject(uiProjectPath(root));
  const model = readUiModel(uiProjectPath(root));
  const deps = packageDeps(model);
  fs.mkdirSync(path.join(root, '.lgui', 'build'), {recursive: true});
  fs.writeFileSync(depsPath(root), JSON.stringify(deps, null, 2) + '\n');
  return {model, deps, types: generateTypes(model, typesDir(root)), headless: generateHeadless(model, headlessDir(root))};
}

export const depsPath = root => path.join(root, '.lgui', 'build', 'deps.json');

// 每个包依赖哪些别的包（子组件、列表子项引用了别的包里的组件）。打开界面时先加载这些包。
export function packageDeps(model) {
  const deps = {};
  for (const pkg of model.packages) {
    const set = new Set();
    for (const component of pkg.components) for (const child of component.children) if (child.ref && child.ref.pkg !== pkg) set.add(child.ref.pkg.name);
    deps[pkg.name] = [...set].sort();
  }
  return deps;
}

export async function generateProjectUi(root, {web = true, unity = false} = {}) {
  const fairy = uiProjectPath(root);
  return {
    web: web ? await generateWeb(fairy, webUiDir(root)) : null,
    unity: unity ? await generateUnity(fairy, unityUiDir(root)) : null
  };
}
