// h5 的默认日志出口：写到浏览器控制台（debug、info、warn、error 各用对应的 console 方法）。
// 框架记的日志（数据里有 code、message、fix）多打一行能直接看懂的说明。
import type {LogLevel, Logger} from '../../../core/index';

export function consoleLogger(category = 'game', context: object = {}): Logger {
  const write = (level: LogLevel, event: string, data: unknown, error: unknown): void => {
    const value = typeof data === 'function' ? (data as () => unknown)() : data;
    const method = level === 'debug' ? console.debug : level === 'info' ? console.info : level === 'warn' ? console.warn : console.error;
    const framework = value as {code?: unknown; message?: unknown; fix?: unknown} | undefined;
    const text = framework && typeof framework.message === 'string' ? `  ${String(framework.code ?? '')}  ${framework.message}${framework.fix ? `  → ${String(framework.fix)}` : ''}` : '';
    const extra = [value, error, Object.keys(context).length ? context : undefined].filter(x => x !== undefined);
    method(`[${category}] ${event}${text}`, ...extra);
  };
  return {
    enabled: () => true,
    debug: (event, data) => write('debug', event, data, undefined),
    info: (event, data) => write('info', event, data, undefined),
    warn: (event, data, error) => write('warn', event, data, error),
    error: (event, error, data) => write('error', event, data, error),
    child: (extra, sub) => consoleLogger(sub ? `${category}.${sub}` : category, {...context, ...extra})
  };
}
