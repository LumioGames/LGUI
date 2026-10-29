// 命令行的统一报错：错误码 + 说明 + 文件和行号（如果有）+ 下一步怎么改。错误码表见 references/error-codes.md。
export class LgCliError extends Error {
  constructor(code, message, {file, line, fix} = {}) {
    super(message);
    this.name = 'LgCliError';
    this.code = code;
    this.file = file;
    this.line = line;
    this.fix = fix;
  }
}
