// 从 ui/ 生成网页和 Unity 用的界面包。不是单独的命令，由 lgui dev、verify、test、unity export 调用。每次都全部重新生成。
import path from 'node:path';
import {generateWeb} from './web.mjs';
import {generateUnity} from './unity.mjs';

export {generateWeb, generateUnity};

// 工程里的固定位置：ui/UI.fairy → .lgui/build/web/ui/、.lgui/build/unity/ui/。
export const uiProjectPath = root => path.join(root, 'ui', 'UI.fairy');
export const webUiDir = root => path.join(root, '.lgui', 'build', 'web', 'ui');
export const unityUiDir = root => path.join(root, '.lgui', 'build', 'unity', 'ui');

export async function generateProjectUi(root, {web = true, unity = false} = {}) {
  const fairy = uiProjectPath(root);
  return {
    web: web ? await generateWeb(fairy, webUiDir(root)) : null,
    unity: unity ? await generateUnity(fairy, unityUiDir(root)) : null
  };
}
