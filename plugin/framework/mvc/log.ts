// 报错和日志的规则（references/mvc-spec.md 第 14 节）。框架的报错分三类：
// ① 代码或界面写错了（缺文本键、图片的包没加载、ArtText 缺字符……）→ fault：记 error；开发和测试里抛出，正式构建里只记录，界面照常显示（比如显示键名）；
// ② 外部的东西失败了（请求、网络图片、声音加载）→ failure：记 warn，不抛，失败交回给代码；
// ③ 正常的先后顺序（await 之后要关的界面已经关了）→ notice：记 info。
// 框架记的日志，事件名由错误码得来（LGUI-RT-090 → lgui_rt_090），数据里有 code、message、fix 和别的字段。
import type {LogLevel, Logger} from '../core/index';
import {LgRuntimeError} from '../core/index';
import {hasRuntime, runtime} from './runtime';

declare const LGUI_DEV: boolean | undefined;

/**
 * 是不是开发模式。打包时由 esbuild 的 define 决定：lgui dev、lgui verify、lgui test 定义 LGUI_DEV = true；
 * 正式构建定义成 false。没定义时（直接打包框架源码）按开发模式。
 */
export function devMode(): boolean {
  return typeof LGUI_DEV === 'undefined' ? true : LGUI_DEV;
}

/** 错误码 → 事件名：LGUI-RT-090 → lgui_rt_090。 */
export const eventOf = (code: string): string => code.toLowerCase().replace(/-/g, '_');

/** 报错里的三段：code、message（不带错误码和「→ 怎么改」）、fix。 */
export function fieldsOf(error: LgRuntimeError): {code: string; message: string; fix: string} {
  const head = `${error.code}  `;
  const tail = `  → ${error.next}`;
  const text = error.message;
  const message = text.startsWith(head) && text.endsWith(tail) ? text.slice(head.length, text.length - tail.length) : text;
  return {code: error.code, message, fix: error.next};
}

// 每个日志出口各记一份「已经记过的」（once）。
const logged = new WeakMap<Logger, Set<string>>();

/** 第 ① 类：写错了。记 error（带 once 时同一个出口相同的只记一次）；开发模式里抛出，正式构建里返回，调用方接着用兜底的显示。 */
export function fault(error: LgRuntimeError, data: object = {}, once?: string): void {
  if (hasRuntime()) {
    const port = runtime().log;
    let seen = logged.get(port);
    if (!seen) { seen = new Set(); logged.set(port, seen); }
    if (!once || !seen.has(once)) {
      if (once) seen.add(once);
      port.error(eventOf(error.code), error, {...fieldsOf(error), ...data});
    }
  }
  if (devMode()) throw error;
}

/** 第 ② 类：外部的东西失败了。记 warn，不抛。 */
export function failure(error: LgRuntimeError, data: object = {}): void {
  runtime().log.warn(eventOf(error.code), {...fieldsOf(error), ...data}, error);
}

/** 第 ③ 类：正常的先后顺序。记 info。 */
export function notice(code: string, message: string, data: object = {}): void {
  runtime().log.info(eventOf(code), {code, message, ...data});
}

// lgui.log：每次写的时候才找当前的日志出口，所以 child 可以写在模块顶层（框架启动之前）。
function lazy(resolve: () => Logger): Logger {
  let owner: Logger | null = null;
  let cached: Logger | null = null;
  const current = (): Logger => {
    const port = runtime().log;
    if (owner !== port) { owner = port; cached = resolve(); }
    return cached as Logger;
  };
  return {
    enabled: (level: LogLevel) => current().enabled(level),
    debug: (event, data) => current().debug(event, data),
    info: (event, data) => current().info(event, data),
    warn: (event, data, error) => current().warn(event, data, error),
    error: (event, error, data) => current().error(event, error, data),
    child: (context, category) => lazy(() => current().child(context, category))
  };
}

/** lgui.log：游戏代码的日志，写到 main.ts 里 lgui.app({ platform: { log } }) 交进来的出口（不交就是后端自带的）。框架还没启动时写日志报 LGUI-RT-050。 */
export const log: Logger = lazy(() => runtime().log);
