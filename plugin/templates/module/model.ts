import { lgui } from 'lgui';

// Model 里只放数据，不放用户能看到的文字：子项显示成什么，由 View 用文本键（lgui.t）决定。
export interface {{NAME}}Item { id: string; n: number; icon: string }

export const {{model}} = lgui.Model(
  {
    items: Array.from({ length: 6 }, (_, i) => ({ id: `item${i + 1}`, n: i + 1, icon: '' })) as {{NAME}}Item[],
    selectedId: null as string | null,
  },
  set => ({
    select(id: string) { set({ selectedId: id }); },
  }),
);
