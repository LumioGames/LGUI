// 命令输出：默认给人看的摘要；--json 时只输出一个 JSON 对象 { ok, command, data, errors }。
import {LgCliError, LgCliErrors} from './errors.mjs';

// 把抛出的东西统一成 LgCliError 数组。不是 LgCliError 的异常属于命令行自己的缺陷，报 LGUI-CLI-999。
export function toErrors(thrown) {
  if (thrown instanceof LgCliErrors) return thrown.errors;
  if (thrown instanceof LgCliError) return [thrown];
  return [new LgCliError('LGUI-CLI-999', `命令行内部错误：${thrown?.stack ?? thrown}`, {fix: '这是 LGUI 的缺陷，请把这段输出报告给维护者。'})];
}

function formatError(error) {
  const where = error.file ? `${error.file}${error.line ? `:${error.line}` : ''}  ` : '';
  return `${where}${error.code}  ${error.message}${error.fix ? `  → ${error.fix}` : ''}`;
}

// result: { command, data, summary: string | string[], errors: LgCliError[] }。返回退出码。
export function emit({command, data = null, summary = [], errors = []}, {json, stdout = process.stdout, stderr = process.stderr} = {}) {
  const ok = errors.length === 0;
  if (json) {
    stdout.write(JSON.stringify({ok, command, data, errors: errors.map(error => error.toJSON())}) + '\n');
  } else {
    for (const line of [summary].flat()) if (line != null) stdout.write(line + '\n');
    for (const error of errors) stderr.write(formatError(error) + '\n');
  }
  return ok ? 0 : 1;
}
