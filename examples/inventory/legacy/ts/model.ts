import { Inventory } from '../../../prototype/shared/model.ts';
import { ITEM_CATALOG, EQUIPMENT_SLOTS, RARITIES } from './catalog.ts';
import type { ItemDefinition, EquipmentSlot, ItemStats, ItemType } from './catalog.ts';

export type StoredItem = { id:string; kind:string; quantity:number };
export type ComplexItem = ItemDefinition & { id:string; quantity:number; equipped:boolean; displayStats:string };
export type Category = 'all' | ItemType;
export type Sort = 'default' | 'name' | 'rarity' | 'price' | 'quantity';
type RewardState = { progressed:boolean; claimedIds:string[]; query:string };
export type SaveData = { schemaVersion:1; capacity:number; walletCoins:number; items:StoredItem[]; equipment:Record<EquipmentSlot, StoredItem|null>; selectedId:string|null; query:string; category:Category; sort:Sort; rewards:RewardState };
const categories: readonly string[] = ['all','equipment','consumable','material','quest'];
const sorts: readonly string[] = ['default','name','rarity','price','quantity'];
const catalog = new Map(ITEM_CATALOG.map(item => [item.kind, item]));
const clone = <T>(value:T):T => JSON.parse(JSON.stringify(value));
const emptyEquipment = () => Object.fromEntries(EQUIPMENT_SLOTS.map(slot => [slot,null])) as Record<EquipmentSlot, StoredItem|null>;
export class InventoryError extends Error {
  code:string;
  constructor(code:string, message:string) { super(message); this.name='InventoryError'; this.code=code; }
}
function requireValue(value:unknown, code:string, message:string):asserts value { if (!value) throw new InventoryError(code,message); }
function record(value:unknown):value is Record<string,unknown> { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function keys(value:Record<string,unknown>, expected:readonly string[]) { requireValue(Object.keys(value).length === expected.length && expected.every(key => Object.prototype.hasOwnProperty.call(value,key)), 'invalid_save', '存档字段不符合 schema'); }
function text(value:unknown):value is string { return typeof value === 'string' && value.length <= 200; }
function stored(value:unknown):StoredItem {
  requireValue(record(value), 'invalid_save', '道具记录必须是对象');
  keys(value,['id','kind','quantity']);
  requireValue(typeof value.id === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(value.id), 'invalid_save', '道具 ID 无效');
  requireValue(typeof value.kind === 'string' && catalog.has(value.kind), 'invalid_save', '未知道具种类');
  const definition = catalog.get(value.kind)!;
  requireValue(Number.isSafeInteger(value.quantity) && Number(value.quantity) > 0 && Number(value.quantity) <= (definition.type === 'equipment' ? 1 : 999), 'invalid_save', '堆叠数量无效');
  return { id:value.id, kind:value.kind, quantity:Number(value.quantity) };
}
const expand = (item:StoredItem,equipped=false):ComplexItem => {
  const definition=catalog.get(item.kind)!;
  const labels:Record<string,string>={attack:'攻击',defense:'防御',health:'生命',mana:'法力',stamina:'耐力',crit:'暴击',durability:'耐久'};
  const displayStats=Object.entries(definition.stats).map(([key,value]) => key === 'durability' ? `${labels[key]} ${value}` : `${labels[key] ?? key} +${value}${key === 'crit' ? '%' : ''}`).join(' · ') || '无属性加成';
  return { ...definition, stats:{ ...definition.stats }, ...item, equipped, displayStats };
};

/** Pure shared state; platform adapters never own inventory rules. */
export class ComplexInventory {
  private state:SaveData;
  private rewards:Inventory;
  private revision=0;
  private listeners=new Set<() => void>();
  private releases=new Map<() => void,() => void>();
  private callbackErrors=0;
  constructor() {
    const items:StoredItem[] = ITEM_CATALOG.map(item => ({ id:`${item.kind}-1`,kind:item.kind,quantity:item.type === 'equipment' ? 1 : item.type === 'quest' ? 2 : item.type === 'consumable' ? 5 : 12 }));
    items.push({id:'sword-2',kind:'sword',quantity:1},{id:'ring-2',kind:'ring',quantity:1});
    this.state={schemaVersion:1,capacity:30,walletCoins:12480,items,equipment:emptyEquipment(),selectedId:'sword-1',query:'',category:'all',sort:'default',rewards:{progressed:false,claimedIds:[],query:''}};
    this.rewards=new Inventory(30);
  }
  get listenerCount() { return this.listeners.size; }
  get listenerErrorCount() { return this.callbackErrors; }
  subscribe(fn:() => void) {
    const existing=this.releases.get(fn);if(existing)return existing;
    let active=true;
    const release=()=>{if(!active)return;active=false;this.listeners.delete(fn);this.releases.delete(fn);};
    this.listeners.add(fn);this.releases.set(fn,release);return release;
  }
  private changed() {
    this.revision++;
    for (const listener of [...this.listeners]) { try { listener(); } catch { this.callbackErrors++; } }
  }
  private bagItem(id:string) {
    const item=this.state.items.find(item => item.id === id);
    requireValue(item,'item_not_found','背包中不存在此道具；已装备物品须先卸下');
    return item;
  }
  private removeOne(item:StoredItem, quantity:number) {
    item.quantity-=quantity;
    if (!item.quantity) {
      this.state.items=this.state.items.filter(value => value.id !== item.id);
      if(this.state.selectedId === item.id) this.state.selectedId=null;
    }
  }
  snapshot() {
    const items=this.state.items.map(item => expand(item));
    const equipment=Object.fromEntries(EQUIPMENT_SLOTS.map(slot => [slot,this.state.equipment[slot] ? expand(this.state.equipment[slot]!,true) : null])) as Record<EquipmentSlot,ComplexItem|null>;
    const equipmentStats:ItemStats={};
    for (const item of Object.values(equipment)) if(item) for(const [key,value] of Object.entries(item.stats)) equipmentStats[key as keyof ItemStats]=(equipmentStats[key as keyof ItemStats] ?? 0)+value;
    const query=this.state.query.trim().toLowerCase();
    const visible=items.filter(item => (this.state.category === 'all' || item.type === this.state.category) && `${item.name} ${item.description} ${item.kind}`.toLowerCase().includes(query));
    const compareText=(a:string,b:string) => a < b ? -1 : a > b ? 1 : 0;
    visible.sort((a,b) => {
      let result=0;
      switch(this.state.sort) {
        case 'name': result=compareText(a.name,b.name); break;
        case 'rarity': result=RARITIES.indexOf(b.rarity)-RARITIES.indexOf(a.rarity); break;
        case 'price': result=b.price-a.price; break;
        case 'quantity': result=b.quantity-a.quantity; break;
        default: result=a.iconIndex-b.iconIndex;
      }
      return result || a.iconIndex-b.iconIndex || compareText(a.id,b.id);
    });
    const selected=items.find(item => item.id === this.state.selectedId) ?? Object.values(equipment).find(item => item?.id === this.state.selectedId) ?? null;
    return clone({schemaVersion:1,revision:this.revision,capacity:this.state.capacity,usedSlots:items.length,coins:this.state.walletCoins+this.rewards.snapshot().coins,
      items,visible,equipment,equipmentStats,selectedId:this.state.selectedId,selected,query:this.state.query,category:this.state.category,sort:this.state.sort,rewards:this.rewards.snapshot()});
  }
  setQuery(query:string) { requireValue(text(query),'invalid_args','搜索词必须为不超过200字符的字符串'); this.state.query=query; this.changed(); }
  setCategory(category:string) { requireValue(categories.includes(category),'invalid_args','分类无效'); this.state.category=category as Category; this.changed(); }
  setSort(sort:string) { requireValue(sorts.includes(sort),'invalid_args','排序无效'); this.state.sort=sort as Sort; this.changed(); }
  select(id:string|null) {
    requireValue(id === null || this.state.items.some(item => item.id === id) || Object.values(this.state.equipment).some(item => item?.id === id), 'item_not_found','选择目标不存在');
    this.state.selectedId=id; this.changed();
  }
  use(id:string) {
    const item=this.bagItem(id), definition=catalog.get(item.kind)!;
    requireValue(definition.type === 'consumable','not_consumable','只有消耗品可以使用');
    this.removeOne(item,1); this.changed();
    return {id,quantity:1,message:`使用了 ${definition.name} ×1`};
  }
  equip(id:string) {
    const item=this.bagItem(id), definition=catalog.get(item.kind)!;
    requireValue(definition.type === 'equipment' && definition.slot,'not_equipment','此道具无法装备');
    const slot=definition.slot, previous=this.state.equipment[slot];
    this.state.items=this.state.items.filter(value => value.id !== id);
    if(previous) this.state.items.push(previous);
    this.state.equipment[slot]=item; this.state.selectedId=id; this.changed();
    return {id,slot,returnedId:previous?.id ?? null,message:`已装备 ${definition.name}`};
  }
  unequip(slot:EquipmentSlot) {
    requireValue(EQUIPMENT_SLOTS.includes(slot),'invalid_args','装备槽无效');
    const item=this.state.equipment[slot];
    requireValue(item,'slot_empty','此装备槽为空');
    requireValue(this.state.items.length < this.state.capacity,'bag_full','背包已满，无法卸下装备');
    this.state.items.push(item); this.state.equipment[slot]=null; this.changed();
    return {id:item.id,slot,message:`已卸下 ${catalog.get(item.kind)!.name}`};
  }
  sell(id:string,quantity:number) {
    const item=this.bagItem(id), definition=catalog.get(item.kind)!;
    requireValue(definition.type !== 'quest','quest_item','任务道具禁止出售');
    requireValue(Number.isSafeInteger(quantity) && quantity > 0 && quantity <= item.quantity,'invalid_quantity','出售数量必须为库存范围内的正整数');
    const earned=definition.price*quantity;
    requireValue(Number.isSafeInteger(earned) && Number.isSafeInteger(this.state.walletCoins+this.rewards.snapshot().coins+earned),'coin_overflow','金币超出安全整数范围');
    this.removeOne(item,quantity); this.state.walletCoins+=earned; this.changed();
    return {id,quantity,earned,message:`出售 ${definition.name} ×${quantity}，获得 ${earned} 金币`};
  }
  setRewardQuery(query:string) { requireValue(text(query),'invalid_args','奖励搜索词无效'); this.rewards.setQuery(query); this.state.rewards.query=query; this.changed(); }
  progress() { this.rewards.progress(); this.state.rewards.progressed=true; this.changed(); return {message:'奖励进度已更新'}; }
  claim(id:string) {
    requireValue(Number.isSafeInteger(this.state.walletCoins+this.rewards.snapshot().coins+10),'coin_overflow','金币超出安全整数范围');
    const result=this.rewards.claim(id);
    requireValue(result.ok,'claim_rejected',result.message);
    this.state.rewards.claimedIds.push(id); this.changed(); return result;
  }
  save():string { return JSON.stringify(this.state); }
  load(json:string) {
    requireValue(typeof json === 'string' && json.length <= 100000,'invalid_save','存档必须为不超过100KB的JSON文本');
    let input:unknown;
    try { input=JSON.parse(json); } catch { throw new InventoryError('invalid_save','存档不是有效JSON'); }
    requireValue(record(input),'invalid_save','存档必须是对象');
    keys(input,['schemaVersion','capacity','walletCoins','items','equipment','selectedId','query','category','sort','rewards']);
    requireValue(input.schemaVersion === 1,'invalid_save','不支持此存档版本');
    requireValue(Number.isInteger(input.capacity) && Number(input.capacity) >= 1 && Number(input.capacity) <= 120,'invalid_save','容量必须为1..120');
    requireValue(Number.isSafeInteger(input.walletCoins) && Number(input.walletCoins) >= 0,'invalid_save','钱包金币必须为非负安全整数');
    requireValue(Array.isArray(input.items) && input.items.length <= Number(input.capacity),'invalid_save','背包容量超限');
    const items=input.items.map(stored);
    requireValue(record(input.equipment),'invalid_save','装备表必须为对象'); keys(input.equipment,EQUIPMENT_SLOTS);
    const equipment=emptyEquipment();
    for(const slot of EQUIPMENT_SLOTS) {
      const value=input.equipment[slot];
      if(value !== null) {
        const item=stored(value);
        requireValue(catalog.get(item.kind)!.slot === slot,'invalid_save','装备槽与道具不符'); equipment[slot]=item;
      }
    }
    const all=[...items,...Object.values(equipment).filter((item):item is StoredItem => item !== null)];
    requireValue(new Set(all.map(item => item.id)).size === all.length,'invalid_save','存在重复道具ID');
    requireValue(input.selectedId === null || (typeof input.selectedId === 'string' && all.some(item => item.id === input.selectedId)),'invalid_save','选择目标无效');
    requireValue(text(input.query) && typeof input.category === 'string' && categories.includes(input.category) && typeof input.sort === 'string' && sorts.includes(input.sort),'invalid_save','搜索或筛选参数无效');
    requireValue(record(input.rewards),'invalid_save','奖励状态必须是对象'); keys(input.rewards,['progressed','claimedIds','query']);
    requireValue(typeof input.rewards.progressed === 'boolean' && text(input.rewards.query) && Array.isArray(input.rewards.claimedIds) && input.rewards.claimedIds.length <= 30,'invalid_save','奖励状态字段无效');
    const claimedIds=input.rewards.claimedIds;
    requireValue(claimedIds.every(id => typeof id === 'string') && new Set(claimedIds).size === claimedIds.length,'invalid_save','奖励领取ID无效或重复');
    // Reconstruct through the original Inventory rules; do not hydrate its private fields.
    const rewards=new Inventory(30);
    if(input.rewards.progressed) rewards.progress();
    for(const id of claimedIds) requireValue(rewards.claim(id).ok,'invalid_save',`奖励记录不可复放: ${id}`);
    rewards.setQuery(input.rewards.query);
    requireValue(Number.isSafeInteger(Number(input.walletCoins)+rewards.snapshot().coins),'invalid_save','合计金币溢出');
    const next:SaveData={schemaVersion:1,capacity:Number(input.capacity),walletCoins:Number(input.walletCoins),items,equipment,selectedId:input.selectedId as string|null,
      query:input.query,category:input.category as Category,sort:input.sort as Sort,rewards:{progressed:input.rewards.progressed,claimedIds:[...claimedIds] as string[],query:input.rewards.query}};
    this.state=next; this.rewards=rewards; this.changed();
    return {message:'背包状态已载入'};
  }
}
