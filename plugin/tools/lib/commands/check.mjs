// lgui check 命令。
import {runCheck} from '../check/index.mjs';
import {LgCliError} from '../errors.mjs';

export async function check({projectRoot, project}) {
  const findings = await runCheck(projectRoot, project);
  const errors = findings.filter(f => f.level !== 'warning');
  const warnings = findings.filter(f => f.level === 'warning');
  const line = f => `${f.file ? `${f.file}${f.line ? `:${f.line}${f.col ? `:${f.col}` : ''}` : ''}  ` : ''}${f.code}  ${f.message}  → ${f.fix}`;
  const summary = [...warnings.map(f => `警告  ${line(f)}`), errors.length || warnings.length ? `${errors.length} 个错误，${warnings.length} 个警告。` : '检查通过：没有错误。'];
  return {
    data: {errors: errors.length, warnings: warnings.length, findings},
    summary,
    errors: errors.map(f => new LgCliError(f.code, f.message, {file: f.file, line: f.line, fix: f.fix}))
  };
}
