// view：把一个子组件交给部件 View（PartView），跟着所在界面一起打开和关闭。
import type {UIComponent} from '../../core/index';
import {LgRuntimeError} from '../../core/index';
import type {BindContext} from './index';

/** 部件 View 的内部接口（PartView 实现它）。 */
export interface PartViewInstance {
  __mount(component: UIComponent, options: {isActive: () => boolean; owner: object}): void;
  __dispose(): void;
}

export function bindPart(component: UIComponent, PartClass: unknown, ctx: BindContext): void {
  const Part = PartClass as (new () => PartViewInstance) & {component?: string; name: string};
  if (typeof Part !== 'function' || !Part.component) throw new LgRuntimeError('LGUI-RT-064', `${ctx.where} 的 view 不是一个 PartView 类。`, '写成 view: XxxPartView。');
  if (component.componentName && component.componentName !== Part.component) {
    throw new LgRuntimeError('LGUI-RT-064', `${ctx.where} 把 ${component.componentName} 交给了 ${Part.name}，但它对应的是 ${Part.component}。`, '让 PartView 的 static component 和子组件一致。');
  }
  const part = new Part();
  part.__mount(component, {isActive: ctx.isActive, owner: ctx.owner});
  ctx.scope.add(() => part.__dispose());
}
