import { lgui } from 'lgui';

export const mainModel = lgui.Model(
  { clicks: 0 },
  (set, get) => ({
    addClick() { set({ clicks: get().clicks + 1 }); },
  }),
);
