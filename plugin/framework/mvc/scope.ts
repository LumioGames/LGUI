// 清理清单：界面打开期间注册的订阅、定时器、收听都登记在这里，关闭时一次全部取消。
export class Scope {
  private items = new Set<() => void>();
  private closed = false;

  /** 登记一个取消函数，返回它自己（方便链式写）。界面已经关了就立刻取消。 */
  add(cancel: () => void): () => void {
    if (this.closed) { cancel(); return cancel; }
    this.items.add(cancel);
    return cancel;
  }

  /** 提前取消其中一项。 */
  remove(cancel: () => void): void {
    if (this.items.delete(cancel)) cancel();
  }

  /** 还登记着多少项（给调试快照用）。 */
  get size(): number { return this.items.size; }

  /** 是否已经清理过。 */
  get isClosed(): boolean { return this.closed; }

  /** 全部取消。 */
  dispose(): void {
    this.closed = true;
    const items = [...this.items];
    this.items.clear();
    for (const cancel of items) cancel();
  }
}
