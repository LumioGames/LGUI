// lgui ui list：列出 ui/ 里的包、组件和控件；--shared 列出通用资源清单（谁是通用的、谁在用、哪些可以合并）。
import {readUiProject} from '../generate/read.mjs';
import {readUiModel} from '../generate/model.mjs';
import {uiProjectPath} from '../generate/index.mjs';
import {listUi, formatUiList} from '../generate/uilist.mjs';
import {buildCatalog, formatCatalog} from '../generate/catalog.mjs';

export async function uiList({projectRoot, project, flags = {}}) {
  await readUiProject(uiProjectPath(projectRoot));
  const model = readUiModel(uiProjectPath(projectRoot));
  if (flags.shared) {
    const catalog = buildCatalog(model, {projectRoot, project});
    return {data: catalog, summary: formatCatalog(catalog)};
  }
  const packages = listUi(model);
  return {data: {packages}, summary: formatUiList(packages)};
}
