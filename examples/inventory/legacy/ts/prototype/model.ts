export type ItemState = 'locked' | 'ready' | 'claimed';
export type Item = { id: string; name: string; state: ItemState; description: string };
export type Snapshot = { items: Item[]; visible: Item[]; coins: number; query: string };

/** Pure game state: no platform objects, timers or UI imports. */
export class Inventory {
  private items: Item[];
  private coins = 0;
  private query = '';
  private listeners = new Set<() => void>();
  constructor(count = 30) {
    this.items = Array.from({ length: count }, (_, i) => ({
      id: `item-${i}`, name: `${['治疗药水', '旅行宝石', '远行卷轴'][i % 3]} ${i + 1}`,
      state: (['locked', 'ready', 'claimed'] as ItemState[])[i % 3],
      description: '旅途中收集的奖励。长文本用于验证自动换行与窄屏布局；达成目标后可以领取一次，关闭再打开背包仍保留领取结果。',
    }));
  }
  snapshot(): Snapshot {
    const items = this.items.map(item => ({ ...item }));
    return { items, visible: items.filter(item => item.name.includes(this.query)), coins: this.coins, query: this.query };
  }
  setQuery(query: string) { this.query = query; this.emit(); }
  progress() {
    this.items = this.items.map(item => item.state === 'locked' ? { ...item, state: 'ready' } : item);
    this.emit();
  }
  claim(id: string) {
    const item = this.items.find(item => item.id === id);
    if (!item || item.state !== 'ready') return { ok: false, message: '奖励不可领取' };
    item.state = 'claimed'; this.coins += 10; this.emit();
    return { ok: true, message: `${item.name} 已领取，获得 10 金币。\n${item.description}` };
  }
  subscribe(fn: () => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  get listenerCount() { return this.listeners.size; }
  private emit() { for (const fn of this.listeners) fn(); }
}
