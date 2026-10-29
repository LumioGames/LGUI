// lgui.request：把一个请求包一层，自带状态（idle → pending → succeeded / failed）和错误码，界面用 pick 读。
import {LgRuntimeError} from '../core/index';
import type {Request, RequestResult, RequestState} from './lgui';
import {runtime} from './runtime';

// 按后端时钟等 ms 毫秒（测试里是假时钟）。
function waitFrames(ms: number): {promise: Promise<void>; cancel: () => void} {
  let off = (): void => {};
  const promise = new Promise<void>(resolve => {
    let elapsed = 0;
    off = runtime().backend.platform.time.onFrame(dt => { elapsed += dt; if (elapsed >= ms) { off(); resolve(); } });
  });
  return {promise, cancel: () => off()};
}

/** 请求失败时的统一处理（S2-G1 接上统一错误提示）。 */
export const requestHooks = {onError: (error: LgRuntimeError): void => { void error; }};

export function createRequest<Args extends unknown[], T>(fn: (...args: Args) => Promise<T>): Request<Args, T> {
  let state: RequestState<T> = {status: 'idle', value: undefined, error: null};
  const listeners = new Set<() => void>();
  const set = (next: RequestState<T>): void => { state = next; for (const l of [...listeners]) l(); };
  let seq = 0;
  return {
    get: () => state,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    async run(...args: Args): Promise<RequestResult<T>> {
      const id = ++seq;
      const {config, backend} = runtime();
      set({status: 'pending', value: undefined, error: null});
      const timeout = waitFrames(config.requestTimeoutMs);
      try {
        const value = await Promise.race([
          fn(...args),
          timeout.promise.then(() => { throw new LgRuntimeError('LGUI-RT-100', `请求超时（${config.requestTimeoutMs} 毫秒）。`, '检查网络；需要更长的时间就改工程配置 requestTimeoutMs。'); })
        ]);
        if (id === seq) set({status: 'succeeded', value, error: null});
        return {ok: true, value, error: null};
      } catch (thrown) {
        const error = thrown instanceof LgRuntimeError ? thrown : new LgRuntimeError('LGUI-RT-101', `请求失败：${thrown instanceof Error ? thrown.message : String(thrown)}`, '看 Service 返回的错误；服务器只下发错误码时，在客户端把错误码映射成文本键。');
        if (id === seq) set({status: 'failed', value: undefined, error});
        backend.platform.log.write('error', error.message);
        if (config.requestErrorToast) requestHooks.onError(error);
        return {ok: false, value: undefined, error};
      } finally {
        timeout.cancel();
      }
    }
  };
}
