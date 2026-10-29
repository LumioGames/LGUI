// 服务：先写接口，再写真实实现和假实现。main.ts 注册真实实现，测试里注册假实现；Controller 用 lgui.service<接口>('名字') 拿。
import {LgRuntimeError} from '../core/index';

let factories: Record<string, () => object> = {};
const instances = new Map<string, object>();

/** 内部用：注册服务（启动时调用；测试里传进来的会覆盖 main.ts 里的）。 */
export function setServices(registered: Record<string, () => object>): void {
  factories = {...registered};
  instances.clear();
}

/** 拿一个服务。第一次用到时才创建。返回的是一个代理，所以在模块顶层写 const s = lgui.service<X>('x') 也没问题。 */
export function service<T>(name: string): T {
  const resolve = (): object => {
    let instance = instances.get(name);
    if (!instance) {
      const factory = factories[name];
      if (!factory) throw new LgRuntimeError('LGUI-RT-102', `没有注册服务 ${name}。`, `在 main.ts 的 lgui.app({ services: { ${name}: () => new …() } }) 里注册，测试里用 lgui.testing.start(app, { services }) 换成假实现。`);
      instance = factory();
      instances.set(name, instance);
    }
    return instance;
  };
  return new Proxy({}, {
    get: (_, key) => {
      const target = resolve() as Record<PropertyKey, unknown>;
      const value = target[key];
      return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(target) : value;
    }
  }) as T;
}
