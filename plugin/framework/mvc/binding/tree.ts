// 树：和列表同样的词，items（节点，子节点放在 children 字段里）+ item（子项 View）+ key + selected + select。
// 节点的展开状态由树自己记（按 key），数据变了也保留；ui/ 里的 clickToExpand 决定点节点时展不展开。
import type {UIComponent, UITree, UITreeNode} from '../../core/index';
import {LgRuntimeError} from '../../core/index';
import {asActor} from '../actor';
import type {ItemKey} from '../types';
import type {BindContext} from './index';
import {watch} from './index';
import type {ItemViewInstance} from './list';

type ItemViewConstructor = (new () => ItemViewInstance) & {component?: string};

export function bindTree(tree: UITree, binding: Record<string, unknown>, ctx: BindContext, key: string): void {
  const ItemClass = binding.item as ItemViewConstructor | undefined;
  if ('items' in binding && !ItemClass) throw new LgRuntimeError('LGUI-RT-064', `${ctx.where} 的树 ${key} 写了 items，但没写 item（节点用的 ItemView）。`, '加上 item: XxxItemView。');
  const keyOf = binding.key as ((item: unknown) => ItemKey) | undefined;
  if ('items' in binding && !keyOf) throw new LgRuntimeError('LGUI-RT-152', `${ctx.where} 的树 ${key} 没写 key。`, '树要写 key（认出同一个节点，展开状态和选中项靠它），比如 key: (n: TreeNode) => n.id。');
  const data = new Map<ItemKey, unknown>();
  const views = new Map<UIComponent, ItemViewInstance>();
  tree.nodeRenderer = (k, component) => {
    if (!ItemClass) return;
    if (ItemClass.component && component.componentName && ItemClass.component !== component.componentName) {
      throw new LgRuntimeError('LGUI-RT-064', `${ctx.where} 的树 ${key} 的节点是 ${component.componentName}，但 item 写的是 ${ItemClass.name}（${ItemClass.component}）。`, '让 ItemView 的 static component 和树的 defaultItem 一致。');
    }
    let view = views.get(component);
    if (!view) { view = new ItemClass(); views.set(component, view); }
    view.__render(component, data.get(k), ctx.isActive, ctx.owner);
  };
  ctx.scope.add(() => {
    tree.nodeRenderer = null;
    for (const view of views.values()) view.__dispose();
    views.clear();
  });
  // 数据 → 节点：key 认出同一个节点，children 字段里是子节点。
  const toNodes = (items: readonly unknown[]): UITreeNode[] => items.map(item => {
    const k = (keyOf as (item: unknown) => ItemKey)(item);
    if (data.has(k)) throw new LgRuntimeError('LGUI-RT-152', `${ctx.where} 的树 ${key} 里有两个节点的 key 都是 ${String(k)}。`, 'key 在整棵树里要唯一。');
    data.set(k, item);
    const children = (item as {children?: unknown}).children;
    return {key: k, children: Array.isArray(children) ? toNodes(children) : []};
  });
  let selectedKey: ItemKey | null = null;
  const applySelected = (): void => { tree.selectedKey = selectedKey !== null && data.has(selectedKey) ? selectedKey : null; };
  if ('items' in binding) {
    watch<readonly unknown[]>(binding.items, ctx, value => {
      data.clear();
      tree.setNodes(toNodes(value));
      if ('selected' in binding) applySelected();
    });
  }
  if ('selected' in binding) watch<ItemKey | null>(binding.selected, ctx, k => { selectedKey = k; applySelected(); });
  if (binding.select) {
    const select = binding.select as (key: ItemKey) => unknown;
    ctx.scope.add(tree.onClickNode(k => { if (ctx.isActive() && data.has(k)) asActor(ctx.owner, () => select(k)); }));
  }
}
