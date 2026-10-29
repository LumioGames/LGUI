// 和「服务器」打交道：出售、购买、领奖。真实实现在本地模拟服务器的延迟和失败；测试用假实现。
import { lgui } from 'lgui';
import { definition } from './CatalogModel';

export interface InventoryService {
  /** 出售，返回得到的金币。 */
  sell(kind: string, quantity: number): Promise<{ earned: number }>;
  /** 购买，返回花掉的金币。 */
  buy(kind: string): Promise<{ cost: number }>;
  /** 领取奖励，返回奖励内容。 */
  claim(rewardId: string): Promise<{ kind: string; quantity: number; coins: number }>;
}

/** 奖励表：领奖时服务器决定给什么。 */
export const REWARDS: Record<string, { kind: string; quantity: number; coins: number }> = {
  daily: { kind: 'elixir', quantity: 1, coins: 50 },
  explorer: { kind: 'crystal', quantity: 3, coins: 120 },
  veteran: { kind: 'staff', quantity: 1, coins: 0 },
};

/** 本地模拟的服务器：每个请求延迟 300–700 毫秒；大约每 6 次出售失败 1 次（演示「出售失败」）。 */
export class LocalInventoryService implements InventoryService {
  private seed = 7;
  private next(): number { this.seed = (this.seed * 1103515245 + 12345) % 2147483648; return this.seed / 2147483648; }
  async sell(kind: string, quantity: number) {
    await lgui.time.wait(300 + this.next() * 400);
    if (this.next() < 0.17) throw new Error('server busy');
    return { earned: definition(kind).price * quantity };
  }
  async buy(kind: string) {
    await lgui.time.wait(300 + this.next() * 400);
    return { cost: definition(kind).price * 2 };
  }
  async claim(rewardId: string) {
    await lgui.time.wait(300 + this.next() * 400);
    const reward = REWARDS[rewardId];
    if (!reward) throw new Error(`unknown reward ${rewardId}`);
    return reward;
  }
}

/** 测试用：马上返回；failNext 让下一次请求失败；holdNext 让下一次出售等到 release() 才返回（测「出售中」）。 */
export class FakeInventoryService implements InventoryService {
  failNext = false;
  holdNext = false;
  calls: string[] = [];
  private waiting: (() => void)[] = [];
  private check(call: string) {
    this.calls.push(call);
    if (this.failNext) { this.failNext = false; throw new Error('fake failure'); }
  }
  release() { for (const resume of this.waiting.splice(0)) resume(); }
  async sell(kind: string, quantity: number) {
    this.check(`sell ${kind} ${quantity}`);
    if (this.holdNext) { this.holdNext = false; await new Promise<void>(resolve => this.waiting.push(resolve)); }
    return { earned: definition(kind).price * quantity };
  }
  async buy(kind: string) { this.check(`buy ${kind}`); return { cost: definition(kind).price * 2 }; }
  async claim(rewardId: string) { this.check(`claim ${rewardId}`); return REWARDS[rewardId]; }
}
