// 道具表（从旧示例 legacy/ts/catalog.ts 迁过来）。名字和说明在文本表里：item.<kind>.name、item.<kind>.desc。
export type ItemType = 'equipment' | 'consumable' | 'material' | 'quest';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type EquipmentSlot = 'weapon' | 'offhand' | 'head' | 'body' | 'feet' | 'ring' | 'neck';
export type StatName = 'attack' | 'defense' | 'health' | 'mana' | 'stamina' | 'crit' | 'durability';
export type ItemStats = Partial<Record<StatName, number>>;

export interface ItemDefinition {
  kind: string;
  type: ItemType;
  rarity: Rarity;
  slot?: EquipmentSlot;
  price: number;
  stats: ItemStats;
  /** 图标顺序和 ui/art-src/Bag/items-atlas.png 一致。 */
  iconIndex: number;
}

const definitions: Omit<ItemDefinition, 'iconIndex'>[] = [
  { kind: 'sword', type: 'equipment', rarity: 'rare', slot: 'weapon', price: 80, stats: { attack: 48, crit: 6, durability: 100 } },
  { kind: 'axe', type: 'equipment', rarity: 'epic', slot: 'weapon', price: 130, stats: { attack: 26 } },
  { kind: 'bow', type: 'equipment', rarity: 'uncommon', slot: 'weapon', price: 65, stats: { attack: 14 } },
  { kind: 'staff', type: 'equipment', rarity: 'legendary', slot: 'weapon', price: 220, stats: { attack: 12, mana: 40 } },
  { kind: 'shield', type: 'equipment', rarity: 'uncommon', slot: 'offhand', price: 55, stats: { defense: 12 } },
  { kind: 'helmet', type: 'equipment', rarity: 'rare', slot: 'head', price: 70, stats: { defense: 8, health: 10 } },
  { kind: 'armor', type: 'equipment', rarity: 'epic', slot: 'body', price: 160, stats: { defense: 22, health: 30 } },
  { kind: 'boots', type: 'equipment', rarity: 'rare', slot: 'feet', price: 75, stats: { defense: 5, stamina: 15 } },
  { kind: 'ring', type: 'equipment', rarity: 'epic', slot: 'ring', price: 105, stats: { attack: 5, mana: 15 } },
  { kind: 'amulet', type: 'equipment', rarity: 'legendary', slot: 'neck', price: 190, stats: { health: 35, defense: 5 } },
  { kind: 'redPotion', type: 'consumable', rarity: 'common', price: 12, stats: { health: 30 } },
  { kind: 'bluePotion', type: 'consumable', rarity: 'common', price: 14, stats: { mana: 25 } },
  { kind: 'staminaPotion', type: 'consumable', rarity: 'uncommon', price: 18, stats: { stamina: 30 } },
  { kind: 'antidote', type: 'consumable', rarity: 'uncommon', price: 16, stats: {} },
  { kind: 'elixir', type: 'consumable', rarity: 'legendary', price: 95, stats: { health: 80, mana: 60 } },
  { kind: 'herb', type: 'material', rarity: 'common', price: 3, stats: {} },
  { kind: 'mushroom', type: 'material', rarity: 'uncommon', price: 5, stats: {} },
  { kind: 'ore', type: 'material', rarity: 'common', price: 8, stats: {} },
  { kind: 'crystal', type: 'material', rarity: 'rare', price: 22, stats: {} },
  { kind: 'leather', type: 'material', rarity: 'common', price: 6, stats: {} },
  { kind: 'key', type: 'quest', rarity: 'epic', price: 100, stats: {} },
  { kind: 'scroll', type: 'quest', rarity: 'rare', price: 45, stats: {} },
  { kind: 'coinPouch', type: 'consumable', rarity: 'uncommon', price: 25, stats: {} },
  { kind: 'gem', type: 'material', rarity: 'legendary', price: 60, stats: {} },
];

export const CATALOG: readonly ItemDefinition[] = definitions.map((item, iconIndex) => ({ ...item, iconIndex }));
export const EQUIPMENT_SLOTS: readonly EquipmentSlot[] = ['weapon', 'offhand', 'head', 'body', 'feet', 'ring', 'neck'];
export const RARITIES: readonly Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
export const STAT_NAMES: readonly StatName[] = ['attack', 'defense', 'health', 'mana', 'stamina', 'crit', 'durability'];

const byKind = new Map(CATALOG.map(item => [item.kind, item]));
export function definition(kind: string): ItemDefinition {
  const found = byKind.get(kind);
  if (!found) throw new Error(`unknown item kind ${kind}`);
  return found;
}
/** 装备最多 1 个一格，任务道具最多 99，其他最多 999。 */
export const maxStack = (kind: string): number => {
  const type = definition(kind).type;
  return type === 'equipment' ? 1 : type === 'quest' ? 99 : 999;
};
export const iconOf = (kind: string): string => `ui://Bag/${kind}`;
