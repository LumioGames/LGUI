// 广播站：通知「发生了一件事」。先声明事件名和参数类型，再广播；谁关心谁收听。
import type {EventDef} from './lgui';
import {LgRuntimeError} from '../core/index';

const names = new Set<string>();

/** 声明一个事件。同名事件只能声明一次。 */
export function defineEvent<P>(name: string): EventDef<P> {
  if (names.has(name)) throw new LgRuntimeError('LGUI-RT-040', `事件 ${name} 已经声明过了。`, '换一个名字，或者 import 已经声明的那个。');
  names.add(name);
  return {name};
}

type Handler = (payload: never) => void;

/** 全局的广播站。 */
export class EventBus {
  private handlers = new Map<EventDef<unknown>, Set<Handler>>();

  /** 收听，返回取消函数。 */
  on<P>(event: EventDef<P>, handler: (payload: P) => void): () => void {
    let set = this.handlers.get(event as EventDef<unknown>);
    if (!set) { set = new Set(); this.handlers.set(event as EventDef<unknown>, set); }
    set.add(handler as Handler);
    return () => { set?.delete(handler as Handler); };
  }

  /** 广播。收听函数出错不影响其他收听者，错误交给 onError。 */
  emit<P>(event: EventDef<P>, payload: P, onError: (error: unknown) => void = error => { throw error; }): void {
    const set = this.handlers.get(event as EventDef<unknown>);
    if (!set) return;
    for (const handler of [...set]) {
      try { (handler as (payload: P) => void)(payload); } catch (error) { onError(error); }
    }
  }

  /** 某个事件当前有几个收听者（给测试和调试用）。 */
  count(event: EventDef<unknown>): number { return this.handlers.get(event)?.size ?? 0; }
}

export const bus = new EventBus();
