// 运行时报错：错误码 + 说明 + 下一步怎么改。错误码表见 references/error-codes.md。

/** 运行时错误。code 是 LGUI-RT-xxx。 */
export class LgRuntimeError extends Error {
  /** 错误码。 */
  readonly code: string;
  /** 下一步怎么改。 */
  readonly next: string;

  constructor(code: string, message: string, next: string) {
    super(`${code}  ${message}  → ${next}`);
    this.name = 'LgRuntimeError';
    this.code = code;
    this.next = next;
  }
}

/** 某个后端还没实现某项功能时报 LGUI-RT-001。 */
export function notImplemented(feature: string, backend: string): LgRuntimeError {
  return new LgRuntimeError('LGUI-RT-001', `${backend} 后端还没实现「${feature}」。`, `换到已经实现这项功能的后端，或者先不用「${feature}」。`);
}
