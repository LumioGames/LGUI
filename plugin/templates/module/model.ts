import { lgui } from 'lgui';

export interface {{NAME}}Item { id: string; label: string; icon: string }

export const {{model}} = lgui.Model(
  {
    items: Array.from({ length: 6 }, (_, i) => ({ id: `item${i + 1}`, label: `第 ${i + 1} 项`, icon: '' })) as {{NAME}}Item[],
    selectedId: null as string | null,
    tab: 'first' as 'first' | 'second',
  },
  set => ({
    select(id: string) { set({ selectedId: id }); },
    switchTab(tab: 'first' | 'second') { set({ tab }); },
  }),
);
