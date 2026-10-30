// 树：items 里的节点带 children，用 ItemView 显示；点节点时 select 收到 key；clickToExpand="1"，点文件夹节点收起 / 展开；
// selected 指向收起的节点里的子节点时，先展开它的父节点。
import { View, ItemView, lgui, pick } from 'lgui';
import type { Bind, ItemBind } from 'lgui';
import type { ControlsPanelUI, TreeItemUI } from 'lgui/ui';
import type { Case } from '../harness';

interface Node { id: string; name: string; children?: Node[] }
const nodes: Node[] = [
  { id: 'weapon', name: 'Weapon', children: [{ id: 'sword', name: 'Sword' }, { id: 'bow', name: 'Bow' }] },
  { id: 'herb', name: 'Herb' },
];
const m = lgui.Model({ nodes, selected: null as string | null, picks: [] as string[] }, (set, get) => ({
  select(id: string) { set({ selected: id, picks: [...get().picks, id] }); },
  focus(id: string) { set({ selected: id }); },
}));

class NodeView extends ItemView<TreeItemUI, Node> {
  static component = 'Controls/TreeItem';
  bind: ItemBind<TreeItemUI, Node> = { title: { text: n => n.name } };
}

class TreeView extends View<ControlsPanelUI> {
  static component = 'Controls/ControlsPanel';
  static layer = 'page' as const;
  static fullScreen = true;
  static bothOrientations = true;
  bind: Bind<ControlsPanelUI> = {
    tree: { items: pick(m, s => s.nodes), item: NodeView, key: (n: Node) => n.id, selected: pick(m, s => s.selected), select: (id: string) => m.select(id) },
    fullButton: { click: () => m.focus('bow') },
  };
}

const c: Case = {
  screen: { width: 1280, height: 720 },
  async run(t) {
    await t.open(TreeView);
    const P = 'Controls/ControlsPanel';
    const counts = [t.items(`${P}.tree`)];
    await t.click(`${P}.tree[2]`);
    await t.click(`${P}.tree[0]`);
    counts.push(t.items(`${P}.tree`));
    await t.click(`${P}.fullButton`);
    counts.push(t.items(`${P}.tree`));
    return { counts, model: m.get() };
  },
};
export default c;
