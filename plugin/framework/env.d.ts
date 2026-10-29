// 测试文件里能用的 Node 模块（只声明 lgui test 需要的那一小部分）。tsconfig.json 的 include 里有这个文件。

declare module 'node:test' {
  /** 定义一个测试。 */
  export function test(name: string, run: () => void | Promise<void>): void;
  /** 定义一组测试。 */
  export function describe(name: string, run: () => void): void;
  /** 定义一个测试（同 test）。 */
  export function it(name: string, run: () => void | Promise<void>): void;
}

declare module 'node:assert/strict' {
  /** 断言工具。 */
  interface Assert {
    /** 为真。 */
    (value: unknown, message?: string): asserts value;
    /** 严格相等。 */
    equal<T>(actual: unknown, expected: T, message?: string): asserts actual is T;
    /** 不相等。 */
    notEqual(actual: unknown, expected: unknown, message?: string): void;
    /** 深度相等。 */
    deepEqual<T>(actual: unknown, expected: T, message?: string): asserts actual is T;
    /** 为真。 */
    ok(value: unknown, message?: string): asserts value;
    /** 会抛错。 */
    throws(run: () => unknown, expected?: RegExp | ((error: unknown) => boolean), message?: string): void;
    /** 会 reject。 */
    rejects(run: Promise<unknown> | (() => Promise<unknown>), expected?: RegExp | ((error: unknown) => boolean), message?: string): Promise<void>;
    /** 匹配正则。 */
    match(value: string, pattern: RegExp, message?: string): void;
  }
  const assert: Assert;
  export default assert;
}
