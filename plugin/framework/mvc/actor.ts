// 「当前是哪个界面在做事」：调用绑定表里的动作和生命周期钩子时，同步记下发起的界面。
// lgui.ui.open 用它记下打开者（不需要跨越 await）。
let current: object | null = null;

/** 以 actor 的身份同步执行 run。 */
export function asActor<T>(actor: object, run: () => T): T {
  const previous = current;
  current = actor;
  try {
    return run();
  } finally {
    current = previous;
  }
}

/** 当前正在做事的界面；在 main.ts 或 await 之后调用时是 null。 */
export function currentActor(): object | null { return current; }
