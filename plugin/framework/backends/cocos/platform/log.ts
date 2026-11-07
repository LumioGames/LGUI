// cocos 的默认日志出口：写到控制台（同 h5 的 log.ts；Web 目标就是浏览器控制台，原生目标是 Creator 控制台）。
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
