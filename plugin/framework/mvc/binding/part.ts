// view：把一个子组件交给部件 View（PartView），跟着所在界面一起打开和关闭。
// 绑在 View 上（不在列表子项里）的部件跟着界面保留：旋转、换语言重建组件时还是同一个实例，只换绑到新组件上；界面关闭时才清理。
// 列表子项里的部件跟着子项一起重建。
import type {UIComponent} from '../../core/index';
import {LgRuntimeError} from '../../core/index';
import type {Scope} from '../scope';
import type {BindContext} from './index';
import {adoptChild} from './index';

/** 部件 View 的内部接口（PartView 实现它）。 */
export interface PartViewInstance {
  __mount(component: UIComponent, options: {isActive: () => boolean; owner: object}): void;
  __unmount(): void;
  __dispose(): void;
}

/** 每个界面保留着的部件：键是「上级部件的键 / 绑定表所在的类名 . 子组件名 # 第几个部件」。 */
const kept = new WeakMap<object, Map<string, PartViewInstance>>();
/** 每一次绑定（一张绑定表绑一次）里已经接了几个部件：同一张表每次的顺序一样，用来认出同一个部件。 */
const counts = new WeakMap<Scope, number>();
/** 正在绑定的上级部件（嵌套的部件绑定是同步进行的）。 */
const parents: {key: string; inItem: boolean}[] = [];

export function bindPart(component: UIComponent, PartClass: unknown, ctx: BindContext): void {
  const Part = PartClass as (new () => PartViewInstance) & {component?: string; name: string};
  if (typeof Part !== 'function' || !Part.component) throw new LgRuntimeError('LGUI-RT-064', `${ctx.where} 的 view 不是一个 PartView 类。`, '写成 view: XxxPartView。');
  if (component.componentName && component.componentName !== Part.component) {
    throw new LgRuntimeError('LGUI-RT-064', `${ctx.where} 把 ${component.componentName} 交给了 ${Part.name}，但它对应的是 ${Part.component}。`, '让 PartView 的 static component 和子组件一致。');
  }
  const parent = parents[parents.length - 1];
  const inItem = Boolean(ctx.item) || Boolean(parent?.inItem);
  const owner = ctx.owner as {__scope?: Scope};
  const n = counts.get(ctx.scope) ?? 0;
  counts.set(ctx.scope, n + 1);
  const key = `${parent ? parent.key + '/' : ''}${ctx.where}.${component.name}#${n}`;
  let part: PartViewInstance | undefined;
  if (inItem || !owner.__scope) {
    // 列表子项里的部件：跟着这一次绑定一起清理。
    part = new Part();
    const off = adoptChild(ctx.owner, part);
    ctx.scope.add(() => { off(); (part as PartViewInstance).__dispose(); });
  } else {
    let parts = kept.get(owner);
    if (!parts) {
      const map = new Map<string, PartViewInstance>();
      kept.set(owner, map);
      owner.__scope.add(() => { kept.delete(owner); for (const p of map.values()) p.__dispose(); });
      parts = map;
    }
    part = parts.get(key);
    if (!part) { part = new Part(); parts.set(key, part); owner.__scope.add(adoptChild(ctx.owner, part)); }
    // 换版重新绑定时只解开旧组件上的绑定，实例留着。
    ctx.scope.add(() => (part as PartViewInstance).__unmount());
  }
  parents.push({key, inItem});
  try {
    part.__mount(component, {isActive: ctx.isActive, owner: ctx.owner});
  } finally {
    parents.pop();
  }
}
