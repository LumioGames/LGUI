// lgui ui list：列出 ui/ 里的包、组件和控件。
import {readUiProject} from '../generate/read.mjs';
import {readUiModel} from '../generate/model.mjs';
import {uiProjectPath} from '../generate/index.mjs';
import {listUi, formatUiList} from '../generate/uilist.mjs';

export async function uiList({projectRoot}) {
  await readUiProject(uiProjectPath(projectRoot));
  const packages = listUi(readUiModel(uiProjectPath(projectRoot)));
  return {data: {packages}, summary: formatUiList(packages)};
}
