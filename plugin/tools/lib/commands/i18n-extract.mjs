// lgui i18n extract：把 ui/ 里用户能看到的固定文字提取到默认语言的 i18n/<语言>.json。
// 已有的翻译保留；新增的键追加在后面；ui/ 里已经没有的键列出来报告，但不删。
import fs from 'node:fs';
import path from 'node:path';
import {readUiProject} from '../generate/read.mjs';
import {readUiModel} from '../generate/model.mjs';
import {uiProjectPath} from '../generate/index.mjs';
import {extractTexts, generateTranslations, readTable} from '../generate/i18n.mjs';

const isUiKey = key => /^[A-Z][A-Za-z0-9]*\/[A-Z][A-Za-z0-9]*\//.test(key);

export async function i18nExtract({projectRoot, project}) {
  await readUiProject(uiProjectPath(projectRoot));
  const model = readUiModel(uiProjectPath(projectRoot));
  const entries = extractTexts(model);
  const language = project.defaultLanguage;
  const file = path.join(projectRoot, 'i18n', `${language}.json`);
  const table = readTable(projectRoot, language);
  const added = [];
  for (const entry of entries) {
    if (!(entry.key in table)) { table[entry.key] = entry.text; added.push(entry.key); }
  }
  const current = new Set(entries.map(e => e.key));
  const stale = Object.keys(table).filter(key => isUiKey(key) && !current.has(key));
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, JSON.stringify(table, null, 2) + '\n');
  generateTranslations(projectRoot, model, project.languages, path.join(projectRoot, '.lgui', 'build', 'web', 'i18n'));
  const summary = [`从 ui/ 提取了 ${entries.length} 条文字，写进 i18n/${language}.json：新增 ${added.length} 条。`];
  if (added.length) summary.push(...added.map(key => `  新增 ${key}`));
  if (stale.length) summary.push(`这些键在 ui/ 里已经没有了（没有删，确认不要了就手动删掉）：`, ...stale.map(key => `  ${key}`));
  const others = project.languages.filter(l => l !== language);
  if (others.length && added.length) summary.push(`别忘了在 ${others.map(l => `i18n/${l}.json`).join('、')} 里加上同样的键。`);
  return {data: {language, keys: entries.length, added, stale}, summary};
}
