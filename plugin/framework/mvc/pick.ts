// pick(数据, 取字段, 格式化?)：告诉框架监听哪个数据源、取哪个字段。
import type {Picked, Readable} from './types';
import {todo} from './todo';

export function pick<S, T>(source: Readable<S>, select: (state: S) => T): Picked<T>;
export function pick<S, T, U>(source: Readable<S>, select: (state: S) => T, format: (value: T) => U): Picked<U>;
export function pick(source: Readable<unknown>, select: (state: unknown) => unknown, format?: (value: unknown) => unknown): Picked<unknown> {
  void source; void select; void format;
  return todo('pick');
}
