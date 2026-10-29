// pick(数据, 取字段, 格式化?)：告诉框架监听哪个数据源、取哪个字段。取出的值没变（Object.is）就不通知。
import type {Picked, Readable} from './types';

export function pick<S, T>(source: Readable<S>, select: (state: S) => T): Picked<T>;
export function pick<S, T, U>(source: Readable<S>, select: (state: S) => T, format: (value: T) => U): Picked<U>;
export function pick(source: Readable<unknown>, select: (state: unknown) => unknown, format?: (value: unknown) => unknown): Picked<unknown> {
  const read = (): unknown => {
    const value = select(source.get());
    return format ? format(value) : value;
  };
  return {
    __picked: true,
    get: read,
    subscribe(listener: () => void): () => void {
      // 每个订阅各记各的上一个值。只比较 select 取出的值，格式化之前比较，避免格式化函数每次返回新对象。
      let last = select(source.get());
      return source.subscribe(() => {
        const next = select(source.get());
        if (Object.is(next, last)) return;
        last = next;
        listener();
      });
    }
  };
}

/** 内部用：一个值是不是 pick 的结果。 */
export function isPicked(value: unknown): value is Picked<unknown> {
  return typeof value === 'object' && value !== null && (value as {__picked?: unknown}).__picked === true;
}
