# 复杂背包共享业务合同

`index.ts` 导出 `createComplexInventoryApp()`、纯 TS `ComplexInventory`、固定 `ITEM_CATALOG`。入口挂载由平台构建负责；共享层没有文件、DOM、CS、计时器或 FairyGUI 依赖。

```ts
const app = createComplexInventoryApp();
app.dispatch('equip', '{"id":"sword-1"}'); // 返回 JSON 字符串
app.snapshot(); // 同 dispatch('snapshot','{}')
```

响应总是 `{ok:boolean,op:string,result:unknown,error:string|null,errorCode:string|null,view,session}`。C# 可只解析固定 view/session/error 字段，同时保存完整 rawTsResponse；result 不要求统一 DTO。错误返回 `ok=false` 和明确 code/message，业务与 revision、订阅会话不变。参数必须是 JSON object。

## 视图

`view` 字段：`schemaVersion:1,revision:number,capacity:number,usedSlots:number,coins:number,items:Item[],visible:Item[],selectedId:string|null,selected:Item|null,equipment:Equipment,equipmentStats:object,query:string,category:string,sort:string,rewards:OriginalInventorySnapshot`。

`Item`：`id,kind,iconIndex,name,type,rarity,quantity,description,price,stats,displayStats,equipped`；装备另有 `slot`。`displayStats` 为共享业务生成的中文字符串，供 C# 直接显示，无需解析动态 stats 对象。`equipped` 为 boolean。所有投影为深拷贝。

`Equipment` 固定属性 `weapon,offhand,head,body,feet,ring,neck`，每项为 Item 或 null。`items/visible` 只含包内物品。装备移入装备槽，原槽物品移回包；`equip` 成功后选择该装备 ID。选择支持包内或已装备物品。卸装后选择同 ID 的包内物品，`equipped=false`；满包卸装显式失败，不丢物品。

默认：容量30、占用26栈、钱包12480金币、选中 `sword-1`、排序 `default`、奖励30项。每种图标一栈，另有 `sword-2/ring-2`。装备每实例1件；消耗品每栈5件、材料12件、任务物2件。金币视图为钱包与原奖励金币合计。

图集6列4行，iconIndex从0依次为：sword, axe, bow, staff, shield, helmet, armor, boots, ring, amulet, redPotion, bluePotion, staminaPotion, antidote, elixir, herb, mushroom, ore, crystal, leather, key, scroll, coinPouch, gem。id默认 `<kind>-1`，额外装备后缀2；ID在排序、筛选、装备与存取档之间保持稳定。

类型：`equipment/consumable/material/quest`。稀有度：`common/uncommon/rare/epic/legendary`。stats使用 `attack/defense/health/mana/stamina`；只聚合装备属性供展示。本轮未建立战斗生命、异常状态或效果计时系统；use只消耗一份消耗品。

## 操作

| op | args | 规则/结果 |
|---|---|---|
| snapshot/open/close | `{}` | open/close幂等，不重置业务 |
| query | `{query:string}` | 不超过200字符；名称、说明、kind搜索，忽略首尾空白和大小写 |
| category | `{category:'all'或类型}` | 与搜索叠加 |
| sort | `{sort:'default'|'name'|'rarity'|'price'|'quantity'}` | default按图集；name码点升序，后三者降序；同值按图集及ID稳定排序 |
| select | `{id:string|null}` | 支持包内/装备；null取消选择 |
| use | `{id:string}` | 仅包内消耗品，数量减1；清零移除并取消该选择 |
| equip | `{id:string}` | 仅包内装备，按slot替换；返回旧物ID，选中新装备 |
| unequip | `{slot:string}` | 非空槽且包未满，原ID回包 |
| sell | `{id:string,quantity:number}` | 正安全整数且不超库存；任务物和已装备物拒绝；金币增加单价×数量 |
| rewardQuery | `{query:string}` | 转发原Inventory搜索 |
| progress | `{}` | 调用原Inventory.progress |
| claim | `{id:'item-N'}` | 调用原Inventory.claim，原三态规则、每次10金币和重复拒绝不变 |
| save | `{}` | `result.json`为存档字符串；不写文件，不改变revision或监听 |
| load | `{json:string}` | 严格校验并先构建候选状态，全部成功才替换；成功revision+1 |

未添加批量出售命令；未知op明确失败。常见errorCode：`invalid_json/invalid_args/item_not_found/not_consumable/not_equipment/slot_empty/bag_full/quest_item/invalid_quantity/coin_overflow/claim_rejected/invalid_save/unknown_operation`。

`session` 精确字段：`open:boolean,listenerCount:number,notifications:number,opens:number,closes:number,closedCallbacks:number,listenerErrors:number`。首次open订阅一次，重复open不会增长；close释放该回调，关闭期间业务可变化。listenerErrors记录被隔离的消费者回调异常，不把已完成的业务变更误报为原子失败。它不是原生内存或C#事件泄漏证明。

## 存档schema 1

```json
{
  "schemaVersion":1,
  "capacity":30,
  "walletCoins":12480,
  "items":[{"id":"sword-1","kind":"sword","quantity":1}],
  "equipment":{"weapon":null,"offhand":null,"head":null,"body":null,"feet":null,"ring":null,"neck":null},
  "selectedId":"sword-1","query":"","category":"all","sort":"default",
  "rewards":{"progressed":false,"claimedIds":[],"query":""}
}
```

上述items为缩写示意。仅实例ID/种类/数量入档；价格、稀有度、说明和属性由当前固定catalog还原。拒绝未知/缺失字段、重复ID（含包与装备之间）、非整数/超上限数量、错误槽位、无效选择、超容量及金币溢出。容量合法范围1..120，默认30；装备数量必须1，其他最大999，JSON最大100KB。UI会话和revision不入档；重复load不重放额外金币，不增加订阅，revision随每次成功load递增。

旧 `../../../prototype/shared/model.ts` 无公开hydrate；共享层持有真实 `new Inventory(30)`，存档用 `progressed + claimedIds + query` 规范状态重建：新建原Inventory，按需progress，再逐项调用原claim。初始已领取项、未达成项、重复ID或不存在ID的非法领取记录全部拒绝。候选重建不触碰正在运行的旧实例。

这保证业务规则复用与错误存档原子性；不提供防作弊、签名或任意未来版本迁移。浏览器localStorage/下载和Unity文件写入均由平台宿主负责。

## 验证

`node --test complex-inventory/shared/complex-inventory.test.mjs`：19项真实状态测试；先记录16项缺实现断言失败，再实现，DTO变更再次红后转绿。最后补充数组筛选字段与旧disposer回归，先2红，分别修复后19绿。覆盖负数/超量/任务物出售、装备替换与满包卸装、重复载入、malformed load、奖励原规则、250开关与订阅释放。原奖励源 SHA256：`e3162e7d648a61dd5817918a8e2a753b4899f97fde0a15c124ca2c9a28742cf6`，测试逐次核对；未修改原文件。
