// 奖励和限时活动：哪些奖励能领、领过没有；活动还剩多久。
import { lgui } from 'lgui';

export type RewardId = 'daily' | 'explorer' | 'veteran';
export interface Reward { id: RewardId; state: 'ready' | 'claimed' | 'expired'; limited: boolean }

/** 限时活动 10 分钟。 */
export const EVENT_MS = 10 * 60 * 1000;

const initial = () => ({
  rewards: [
    { id: 'daily', state: 'ready', limited: false },
    { id: 'explorer', state: 'ready', limited: true },
    { id: 'veteran', state: 'ready', limited: false },
  ] as Reward[],
  /** 限时活动的结束时间（lgui.time.now() 的毫秒）。 */
  eventEndsAt: 0,
  /** 活动还剩多少毫秒。 */
  eventLeft: EVENT_MS,
  /** 刚领到的东西（领奖窗口显示它）。 */
  lastClaim: { items: [] as { kind: string; quantity: number }[], coins: 0 },
});

export const rewardModel = lgui.Model(initial(), (set, get) => ({
  reset() { set(initial()); },
  startEvent(now: number) { set({ eventEndsAt: now + EVENT_MS, eventLeft: EVENT_MS }); },
  tick(left: number) { set({ eventLeft: left }); },
  /** 活动结束：没领的限时奖励过期。 */
  endEvent() { set({ eventLeft: 0, rewards: get().rewards.map(r => (r.limited && r.state === 'ready' ? { ...r, state: 'expired' } : r)) }); },
  claimed(id: RewardId) { set({ rewards: get().rewards.map(r => (r.id === id ? { ...r, state: 'claimed' } : r)) }); },
  setLastClaim(items: { kind: string; quantity: number }[], coins: number) { set({ lastClaim: { items, coins } }); },
}));

export const readyRewards = (rewards: Reward[]): Reward[] => rewards.filter(r => r.state === 'ready');
