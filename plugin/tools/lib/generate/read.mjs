// 读取 ui/ 里的 FairyGUI 工程：先用 OpenFairyGUI 校验，再读成 Document。
import fs from 'node:fs';
import {openFairyGUI} from '../vendor.mjs';
import {LgCliError, LgCliErrors} from '../errors.mjs';

// OpenFairyGUI 生成时会往控制台打日志；收集起来放进结果，不让它混进 --json 输出。
export async function quiet(run) {
  const log = [];
  const saved = {log: console.log, info: console.info, warn: console.warn};
  console.log = console.info = console.warn = (...args) => log.push(args.join(' '));
  try {
    return {value: await run(), log};
  } finally {
    Object.assign(console, saved);
  }
}

// 校验不过报 LGUI-CLI-020，附上 OpenFairyGUI 返回的每一条问题。
export async function readUiProject(fairyPath) {
  if (!fs.existsSync(fairyPath)) {
    throw new LgCliError('LGUI-CLI-020', `找不到界面工程文件 ${fairyPath}。`, {file: fairyPath, fix: '确认工程里有 ui/UI.fairy；没有就用 lgui init 新建工程。'});
  }
  const {coreNode, functions} = openFairyGUI();
  const {value: report} = await quiet(() => functions.validateProjectNode(fairyPath));
  if (report.status !== 'valid') {
    const issues = report.diagnostics.length ? report.diagnostics : [{message: `校验结果是 ${report.status}`}];
    throw new LgCliErrors(issues.map(issue => new LgCliError('LGUI-CLI-020', `界面工程校验没通过：${issue.message ?? JSON.stringify(issue)}`, {
      file: issue.path ?? issue.file ?? fairyPath,
      line: issue.line,
      fix: '按提示改 ui/ 里对应的文件。'
    })));
  }
  return new coreNode.NodeIO().readProject(fairyPath);
}
