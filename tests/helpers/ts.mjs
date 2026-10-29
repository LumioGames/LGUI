// 测试用的 TS 工具：用随插件带的 TypeScript 做类型检查，用 esbuild 把 TS 打包成可以 import 的模块。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {typescript, esbuild} from '../../plugin/tools/lib/vendor.mjs';

export const strictOptions = {
  strict: true, target: 'ES2020', module: 'ESNext', moduleResolution: 'Bundler', noEmit: true,
  isolatedModules: true, verbatimModuleSyntax: true, lib: ['es2020'], types: [], skipLibCheck: true
};

// 类型检查一组文件，返回格式化后的错误（空数组表示通过）。
export function typecheck(files, options = {}) {
  const ts = typescript();
  const {options: compilerOptions, errors} = ts.convertCompilerOptionsFromJson({...strictOptions, ...options}, process.cwd());
  if (errors.length) throw Error(ts.formatDiagnostics(errors, host(ts)));
  const program = ts.createProgram(files, compilerOptions);
  return ts.getPreEmitDiagnostics(program).map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n') + (d.file ? `  (${path.basename(d.file.fileName)}:${d.file.getLineAndCharacterOfPosition(d.start ?? 0).line + 1})` : ''));
}

const host = ts => ({getCanonicalFileName: f => f, getCurrentDirectory: () => process.cwd(), getNewLine: () => '\n'});

// 把一个 TS 入口打包成 ESM 并 import 进来。alias 同工程里的写法。
export async function importTs(entry, {alias = {}} = {}) {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-ts-')), 'bundle.mjs');
  await esbuild().build({entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', target: 'es2020', outfile: out, alias, logLevel: 'silent'});
  return import(pathToFileURL(out).href);
}

// 按工程自己的 tsconfig.json 做类型检查（S2-H1 的 lgui check 完成前，测试里先用它）。
export function typecheckProject(root) {
  const ts = typescript();
  const configFile = path.join(root, 'tsconfig.json');
  const {config, error} = ts.readConfigFile(configFile, ts.sys.readFile);
  if (error) throw Error(ts.flattenDiagnosticMessageText(error.messageText, '\n'));
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  return ts.getPreEmitDiagnostics(program).map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n') + (d.file ? `  (${path.relative(root, d.file.fileName)}:${d.file.getLineAndCharacterOfPosition(d.start ?? 0).line + 1})` : ''));
}
