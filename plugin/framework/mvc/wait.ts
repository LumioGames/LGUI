// 按帧等待：把每帧的时间累计起来，到 ms 毫秒就完成。lgui test 的假时钟也能推进；切到后台时帧停了，等待也跟着停（和 Unity 一样）。
// lgui.time.wait 和请求超时都用它。
import {runtime} from './runtime';

/** 等 ms 毫秒（ms ≤ 0 马上完成）。cancel 之后永远不会完成。 */
export function frameWait(ms: number): {promise: Promise<void>; cancel: () => void} {
  let off = (): void => {};
  const promise = new Promise<void>(resolve => {
    if (ms <= 0) { resolve(); return; }
    let elapsed = 0;
    off = runtime().backend.platform.time.onFrame(dt => {
      elapsed += dt;
      if (elapsed >= ms) { off(); resolve(); }
    });
  });
  return {promise, cancel: () => off()};
}
