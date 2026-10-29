export type ItemType = 'equipment' | 'consumable' | 'material' | 'quest';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type EquipmentSlot = 'weapon' | 'offhand' | 'head' | 'body' | 'feet' | 'ring' | 'neck';
export type ItemStats = { attack?: number; defense?: number; health?: number; mana?: number; stamina?: number; crit?: number; durability?: number };
export type ItemDefinition = { kind: string; name: string; type: ItemType; rarity: Rarity; description: string; price: number; stats: ItemStats; slot?: EquipmentSlot; iconIndex: number };
type DefinitionInput = Omit<ItemDefinition, 'iconIndex'>;

const definitions: DefinitionInput[] = [
  { kind:'sword', name:'霜纹长剑', type:'equipment', rarity:'rare', slot:'weapon', price:80, stats:{attack:48,crit:6,durability:100}, description:'剑身流转着如霜的纹路，\n仿佛封存了北境的寒风。\n它曾陪伴无数旅者穿越黑暗，迎向黎明。' },
  { kind:'axe', name:'赤岩战斧', type:'equipment', rarity:'epic', slot:'weapon', price:130, stats:{attack:26}, description:'以赤岩矿锻造的沉重战斧，斧刃上仍留着山火般的余温。' },
  { kind:'bow', name:'林语长弓', type:'equipment', rarity:'uncommon', slot:'weapon', price:65, stats:{attack:14}, description:'轻巧的林地长弓，弓弦仿佛仍留着清晨的露水。' },
  { kind:'staff', name:'星辉法杖', type:'equipment', rarity:'legendary', slot:'weapon', price:220, stats:{attack:12,mana:40}, description:'湛蓝宝石中封存着一缕星光，寂静时能听见它的低吟。' },
  { kind:'shield', name:'雄狮圆盾', type:'equipment', rarity:'uncommon', slot:'offhand', price:55, stats:{defense:12}, description:'钢铁盾面镌着雄狮纹章，边缘的磨痕诉说着守卫的誓言。' },
  { kind:'helmet', name:'守望者头盔', type:'equipment', rarity:'rare', slot:'head', price:70, stats:{defense:8,health:10}, description:'古老守望者留下的头盔，银亮面甲后藏着不屈的意志。' },
  { kind:'armor', name:'曙光胸甲', type:'equipment', rarity:'epic', slot:'body', price:160, stats:{defense:22,health:30}, description:'晨曦映照下泛出金色光泽的胸甲，铭刻着远征者的祝福。' },
  { kind:'boots', name:'疾风短靴', type:'equipment', rarity:'rare', slot:'feet', price:75, stats:{defense:5,stamina:15}, description:'柔软皮革缝制的短靴，适合在山径和荒野间长途跋涉。' },
  { kind:'ring', name:'红玉指环', type:'equipment', rarity:'epic', slot:'ring', price:105, stats:{attack:5,mana:15}, description:'温润红玉嵌在细致的金环之中，像一颗沉睡的火种。' },
  { kind:'amulet', name:'碧玉护符', type:'equipment', rarity:'legendary', slot:'neck', price:190, stats:{health:35,defense:5}, description:'碧蓝宝石映着水波般的光泽，传说能守护远行之人。' },
  { kind:'redPotion', name:'治疗药水', type:'consumable', rarity:'common', price:12, stats:{health:30}, description:'红色药液散发着微甜的草木香气，是旅途中的常备补给。' },
  { kind:'bluePotion', name:'法力药水', type:'consumable', rarity:'common', price:14, stats:{mana:25}, description:'清澈的蓝色药液映出点点星辉，法师们总会随身携带。' },
  { kind:'staminaPotion', name:'耐力药水', type:'consumable', rarity:'uncommon', price:18, stats:{stamina:30}, description:'翠绿药液中翻涌着细小气泡，闻起来像雨后的柑橘林。' },
  { kind:'antidote', name:'解毒剂', type:'consumable', rarity:'uncommon', price:16, stats:{}, description:'深紫色的急救药剂，瓶口系着药师留下的细绳。' },
  { kind:'elixir', name:'星露灵药', type:'consumable', rarity:'legendary', price:95, stats:{health:80,mana:60}, description:'灵露凝成金色微光，只需一滴便能照亮整只玻璃瓶。' },
  { kind:'herb', name:'晨露草', type:'material', rarity:'common', price:3, stats:{}, description:'沾着晨露的鲜嫩药草，叶间还藏着一朵白色小花。' },
  { kind:'mushroom', name:'萤光蘑菇', type:'material', rarity:'uncommon', price:5, stats:{}, description:'红伞上缀着浅色斑点，常生长在潮湿而幽静的林地。' },
  { kind:'ore', name:'赤铁矿', type:'material', rarity:'common', price:8, stats:{}, description:'沉甸甸的深灰矿石，是铁匠炉边最受欢迎的原料。' },
  { kind:'crystal', name:'霜蓝水晶', type:'material', rarity:'rare', price:22, stats:{}, description:'晶簇透出冰蓝光芒，在掌心留下微微的凉意。' },
  { kind:'leather', name:'柔韧皮革', type:'material', rarity:'common', price:6, stats:{}, description:'卷得整齐的柔韧皮革，能用来修补装备和旅者的行囊。' },
  { kind:'key', name:'古城钥匙', type:'quest', rarity:'epic', price:100, stats:{}, description:'精巧的黄铜钥匙，通往古城深处一扇被遗忘的大门。' },
  { kind:'scroll', name:'失落地图卷轴', type:'quest', rarity:'rare', price:45, stats:{}, description:'带着火漆印记的羊皮卷，上面记录着失落遗迹的方位。' },
  { kind:'coinPouch', name:'旅行补给袋', type:'consumable', rarity:'uncommon', price:25, stats:{}, description:'绣着罗盘纹章的皮袋，袋口隐约闪着金币的光。' },
  { kind:'gem', name:'暮色宝石', type:'material', rarity:'legendary', price:60, stats:{}, description:'切面中流转着暮紫色光芒，深受远方商人的喜爱。' },
];

/** Six columns by four rows; order is the shared image atlas contract. */
export const ITEM_CATALOG: readonly ItemDefinition[] = Object.freeze(definitions.map((item, iconIndex) => Object.freeze({ ...item, stats:Object.freeze({ ...item.stats }), iconIndex })));
export const EQUIPMENT_SLOTS: readonly EquipmentSlot[] = Object.freeze(['weapon','offhand','head','body','feet','ring','neck']);
export const RARITIES: readonly Rarity[] = Object.freeze(['common','uncommon','rare','epic','legendary']);
