(function() {
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/typeof.js
	function _typeof(o) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof(o);
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/toPrimitive.js
	function toPrimitive(t, r) {
		if ("object" != _typeof(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r || "default");
			if ("object" != _typeof(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/toPropertyKey.js
	function toPropertyKey(t) {
		var i = toPrimitive(t, "string");
		return "symbol" == _typeof(i) ? i : i + "";
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/defineProperty.js
	function _defineProperty(e, r, t) {
		return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: !0,
			configurable: !0,
			writable: !0
		}) : e[r] = t, e;
	}
	//#endregion
	//#region 验证/prototype/shared/model.ts
	/** Pure game state: no platform objects, timers or UI imports. */
	var Inventory = class {
		constructor(count = 30) {
			_defineProperty(this, "items", void 0);
			_defineProperty(this, "coins", 0);
			_defineProperty(this, "query", "");
			_defineProperty(this, "listeners", /* @__PURE__ */ new Set());
			this.items = Array.from({ length: count }, (_, i) => ({
				id: `item-${i}`,
				name: `${[
					"治疗药水",
					"旅行宝石",
					"远行卷轴"
				][i % 3]} ${i + 1}`,
				state: [
					"locked",
					"ready",
					"claimed"
				][i % 3],
				description: "旅途中收集的奖励。长文本用于验证自动换行与窄屏布局；达成目标后可以领取一次，关闭再打开背包仍保留领取结果。"
			}));
		}
		snapshot() {
			const items = this.items.map((item) => ({ ...item }));
			return {
				items,
				visible: items.filter((item) => item.name.includes(this.query)),
				coins: this.coins,
				query: this.query
			};
		}
		setQuery(query) {
			this.query = query;
			this.emit();
		}
		progress() {
			this.items = this.items.map((item) => item.state === "locked" ? {
				...item,
				state: "ready"
			} : item);
			this.emit();
		}
		claim(id) {
			const item = this.items.find((item) => item.id === id);
			if (!item || item.state !== "ready") return {
				ok: false,
				message: "奖励不可领取"
			};
			item.state = "claimed";
			this.coins += 10;
			this.emit();
			return {
				ok: true,
				message: `${item.name} 已领取，获得 10 金币。\n${item.description}`
			};
		}
		subscribe(fn) {
			this.listeners.add(fn);
			return () => {
				this.listeners.delete(fn);
			};
		}
		get listenerCount() {
			return this.listeners.size;
		}
		emit() {
			for (const fn of this.listeners) fn();
		}
	};
	/** Six columns by four rows; order is the shared image atlas contract. */
	var ITEM_CATALOG = Object.freeze([
		{
			kind: "sword",
			name: "霜纹长剑",
			type: "equipment",
			rarity: "rare",
			slot: "weapon",
			price: 80,
			stats: {
				attack: 48,
				crit: 6,
				durability: 100
			},
			description: "剑身流转着如霜的纹路，\n仿佛封存了北境的寒风。\n它曾陪伴无数旅者穿越黑暗，迎向黎明。"
		},
		{
			kind: "axe",
			name: "赤岩战斧",
			type: "equipment",
			rarity: "epic",
			slot: "weapon",
			price: 130,
			stats: { attack: 26 },
			description: "以赤岩矿锻造的沉重战斧，斧刃上仍留着山火般的余温。"
		},
		{
			kind: "bow",
			name: "林语长弓",
			type: "equipment",
			rarity: "uncommon",
			slot: "weapon",
			price: 65,
			stats: { attack: 14 },
			description: "轻巧的林地长弓，弓弦仿佛仍留着清晨的露水。"
		},
		{
			kind: "staff",
			name: "星辉法杖",
			type: "equipment",
			rarity: "legendary",
			slot: "weapon",
			price: 220,
			stats: {
				attack: 12,
				mana: 40
			},
			description: "湛蓝宝石中封存着一缕星光，寂静时能听见它的低吟。"
		},
		{
			kind: "shield",
			name: "雄狮圆盾",
			type: "equipment",
			rarity: "uncommon",
			slot: "offhand",
			price: 55,
			stats: { defense: 12 },
			description: "钢铁盾面镌着雄狮纹章，边缘的磨痕诉说着守卫的誓言。"
		},
		{
			kind: "helmet",
			name: "守望者头盔",
			type: "equipment",
			rarity: "rare",
			slot: "head",
			price: 70,
			stats: {
				defense: 8,
				health: 10
			},
			description: "古老守望者留下的头盔，银亮面甲后藏着不屈的意志。"
		},
		{
			kind: "armor",
			name: "曙光胸甲",
			type: "equipment",
			rarity: "epic",
			slot: "body",
			price: 160,
			stats: {
				defense: 22,
				health: 30
			},
			description: "晨曦映照下泛出金色光泽的胸甲，铭刻着远征者的祝福。"
		},
		{
			kind: "boots",
			name: "疾风短靴",
			type: "equipment",
			rarity: "rare",
			slot: "feet",
			price: 75,
			stats: {
				defense: 5,
				stamina: 15
			},
			description: "柔软皮革缝制的短靴，适合在山径和荒野间长途跋涉。"
		},
		{
			kind: "ring",
			name: "红玉指环",
			type: "equipment",
			rarity: "epic",
			slot: "ring",
			price: 105,
			stats: {
				attack: 5,
				mana: 15
			},
			description: "温润红玉嵌在细致的金环之中，像一颗沉睡的火种。"
		},
		{
			kind: "amulet",
			name: "碧玉护符",
			type: "equipment",
			rarity: "legendary",
			slot: "neck",
			price: 190,
			stats: {
				health: 35,
				defense: 5
			},
			description: "碧蓝宝石映着水波般的光泽，传说能守护远行之人。"
		},
		{
			kind: "redPotion",
			name: "治疗药水",
			type: "consumable",
			rarity: "common",
			price: 12,
			stats: { health: 30 },
			description: "红色药液散发着微甜的草木香气，是旅途中的常备补给。"
		},
		{
			kind: "bluePotion",
			name: "法力药水",
			type: "consumable",
			rarity: "common",
			price: 14,
			stats: { mana: 25 },
			description: "清澈的蓝色药液映出点点星辉，法师们总会随身携带。"
		},
		{
			kind: "staminaPotion",
			name: "耐力药水",
			type: "consumable",
			rarity: "uncommon",
			price: 18,
			stats: { stamina: 30 },
			description: "翠绿药液中翻涌着细小气泡，闻起来像雨后的柑橘林。"
		},
		{
			kind: "antidote",
			name: "解毒剂",
			type: "consumable",
			rarity: "uncommon",
			price: 16,
			stats: {},
			description: "深紫色的急救药剂，瓶口系着药师留下的细绳。"
		},
		{
			kind: "elixir",
			name: "星露灵药",
			type: "consumable",
			rarity: "legendary",
			price: 95,
			stats: {
				health: 80,
				mana: 60
			},
			description: "灵露凝成金色微光，只需一滴便能照亮整只玻璃瓶。"
		},
		{
			kind: "herb",
			name: "晨露草",
			type: "material",
			rarity: "common",
			price: 3,
			stats: {},
			description: "沾着晨露的鲜嫩药草，叶间还藏着一朵白色小花。"
		},
		{
			kind: "mushroom",
			name: "萤光蘑菇",
			type: "material",
			rarity: "uncommon",
			price: 5,
			stats: {},
			description: "红伞上缀着浅色斑点，常生长在潮湿而幽静的林地。"
		},
		{
			kind: "ore",
			name: "赤铁矿",
			type: "material",
			rarity: "common",
			price: 8,
			stats: {},
			description: "沉甸甸的深灰矿石，是铁匠炉边最受欢迎的原料。"
		},
		{
			kind: "crystal",
			name: "霜蓝水晶",
			type: "material",
			rarity: "rare",
			price: 22,
			stats: {},
			description: "晶簇透出冰蓝光芒，在掌心留下微微的凉意。"
		},
		{
			kind: "leather",
			name: "柔韧皮革",
			type: "material",
			rarity: "common",
			price: 6,
			stats: {},
			description: "卷得整齐的柔韧皮革，能用来修补装备和旅者的行囊。"
		},
		{
			kind: "key",
			name: "古城钥匙",
			type: "quest",
			rarity: "epic",
			price: 100,
			stats: {},
			description: "精巧的黄铜钥匙，通往古城深处一扇被遗忘的大门。"
		},
		{
			kind: "scroll",
			name: "失落地图卷轴",
			type: "quest",
			rarity: "rare",
			price: 45,
			stats: {},
			description: "带着火漆印记的羊皮卷，上面记录着失落遗迹的方位。"
		},
		{
			kind: "coinPouch",
			name: "旅行补给袋",
			type: "consumable",
			rarity: "uncommon",
			price: 25,
			stats: {},
			description: "绣着罗盘纹章的皮袋，袋口隐约闪着金币的光。"
		},
		{
			kind: "gem",
			name: "暮色宝石",
			type: "material",
			rarity: "legendary",
			price: 60,
			stats: {},
			description: "切面中流转着暮紫色光芒，深受远方商人的喜爱。"
		}
	].map((item, iconIndex) => Object.freeze({
		...item,
		stats: Object.freeze({ ...item.stats }),
		iconIndex
	})));
	var EQUIPMENT_SLOTS = Object.freeze([
		"weapon",
		"offhand",
		"head",
		"body",
		"feet",
		"ring",
		"neck"
	]);
	var RARITIES = Object.freeze([
		"common",
		"uncommon",
		"rare",
		"epic",
		"legendary"
	]);
	//#endregion
	//#region 验证/unity-migration/complex-inventory/shared/model.ts
	var categories = [
		"all",
		"equipment",
		"consumable",
		"material",
		"quest"
	];
	var sorts = [
		"default",
		"name",
		"rarity",
		"price",
		"quantity"
	];
	var catalog = new Map(ITEM_CATALOG.map((item) => [item.kind, item]));
	var clone = (value) => JSON.parse(JSON.stringify(value));
	var emptyEquipment = () => Object.fromEntries(EQUIPMENT_SLOTS.map((slot) => [slot, null]));
	var InventoryError = class extends Error {
		constructor(code, message) {
			super(message);
			_defineProperty(this, "code", void 0);
			this.name = "InventoryError";
			this.code = code;
		}
	};
	function requireValue(value, code, message) {
		if (!value) throw new InventoryError(code, message);
	}
	function record(value) {
		return value !== null && typeof value === "object" && !Array.isArray(value);
	}
	function keys(value, expected) {
		requireValue(Object.keys(value).length === expected.length && expected.every((key) => Object.prototype.hasOwnProperty.call(value, key)), "invalid_save", "存档字段不符合 schema");
	}
	function text(value) {
		return typeof value === "string" && value.length <= 200;
	}
	function stored(value) {
		requireValue(record(value), "invalid_save", "道具记录必须是对象");
		keys(value, [
			"id",
			"kind",
			"quantity"
		]);
		requireValue(typeof value.id === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(value.id), "invalid_save", "道具 ID 无效");
		requireValue(typeof value.kind === "string" && catalog.has(value.kind), "invalid_save", "未知道具种类");
		const definition = catalog.get(value.kind);
		requireValue(Number.isSafeInteger(value.quantity) && Number(value.quantity) > 0 && Number(value.quantity) <= (definition.type === "equipment" ? 1 : 999), "invalid_save", "堆叠数量无效");
		return {
			id: value.id,
			kind: value.kind,
			quantity: Number(value.quantity)
		};
	}
	var expand = (item, equipped = false) => {
		const definition = catalog.get(item.kind);
		const labels = {
			attack: "攻击",
			defense: "防御",
			health: "生命",
			mana: "法力",
			stamina: "耐力",
			crit: "暴击",
			durability: "耐久"
		};
		const displayStats = Object.entries(definition.stats).map(([key, value]) => key === "durability" ? `${labels[key]} ${value}` : `${labels[key] ?? key} +${value}${key === "crit" ? "%" : ""}`).join(" · ") || "无属性加成";
		return {
			...definition,
			stats: { ...definition.stats },
			...item,
			equipped,
			displayStats
		};
	};
	/** Pure shared state; platform adapters never own inventory rules. */
	var ComplexInventory = class {
		constructor() {
			_defineProperty(this, "state", void 0);
			_defineProperty(this, "rewards", void 0);
			_defineProperty(this, "revision", 0);
			_defineProperty(this, "listeners", /* @__PURE__ */ new Set());
			_defineProperty(this, "releases", /* @__PURE__ */ new Map());
			_defineProperty(this, "callbackErrors", 0);
			const items = ITEM_CATALOG.map((item) => ({
				id: `${item.kind}-1`,
				kind: item.kind,
				quantity: item.type === "equipment" ? 1 : item.type === "quest" ? 2 : item.type === "consumable" ? 5 : 12
			}));
			items.push({
				id: "sword-2",
				kind: "sword",
				quantity: 1
			}, {
				id: "ring-2",
				kind: "ring",
				quantity: 1
			});
			this.state = {
				schemaVersion: 1,
				capacity: 30,
				walletCoins: 12480,
				items,
				equipment: emptyEquipment(),
				selectedId: "sword-1",
				query: "",
				category: "all",
				sort: "default",
				rewards: {
					progressed: false,
					claimedIds: [],
					query: ""
				}
			};
			this.rewards = new Inventory(30);
		}
		get listenerCount() {
			return this.listeners.size;
		}
		get listenerErrorCount() {
			return this.callbackErrors;
		}
		subscribe(fn) {
			const existing = this.releases.get(fn);
			if (existing) return existing;
			let active = true;
			const release = () => {
				if (!active) return;
				active = false;
				this.listeners.delete(fn);
				this.releases.delete(fn);
			};
			this.listeners.add(fn);
			this.releases.set(fn, release);
			return release;
		}
		changed() {
			this.revision++;
			for (const listener of [...this.listeners]) try {
				listener();
			} catch {
				this.callbackErrors++;
			}
		}
		bagItem(id) {
			const item = this.state.items.find((item) => item.id === id);
			requireValue(item, "item_not_found", "背包中不存在此道具；已装备物品须先卸下");
			return item;
		}
		removeOne(item, quantity) {
			item.quantity -= quantity;
			if (!item.quantity) {
				this.state.items = this.state.items.filter((value) => value.id !== item.id);
				if (this.state.selectedId === item.id) this.state.selectedId = null;
			}
		}
		snapshot() {
			const items = this.state.items.map((item) => expand(item));
			const equipment = Object.fromEntries(EQUIPMENT_SLOTS.map((slot) => [slot, this.state.equipment[slot] ? expand(this.state.equipment[slot], true) : null]));
			const equipmentStats = {};
			for (const item of Object.values(equipment)) if (item) for (const [key, value] of Object.entries(item.stats)) equipmentStats[key] = (equipmentStats[key] ?? 0) + value;
			const query = this.state.query.trim().toLowerCase();
			const visible = items.filter((item) => (this.state.category === "all" || item.type === this.state.category) && `${item.name} ${item.description} ${item.kind}`.toLowerCase().includes(query));
			const compareText = (a, b) => a < b ? -1 : a > b ? 1 : 0;
			visible.sort((a, b) => {
				let result = 0;
				switch (this.state.sort) {
					case "name":
						result = compareText(a.name, b.name);
						break;
					case "rarity":
						result = RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity);
						break;
					case "price":
						result = b.price - a.price;
						break;
					case "quantity":
						result = b.quantity - a.quantity;
						break;
					default: result = a.iconIndex - b.iconIndex;
				}
				return result || a.iconIndex - b.iconIndex || compareText(a.id, b.id);
			});
			const selected = items.find((item) => item.id === this.state.selectedId) ?? Object.values(equipment).find((item) => item?.id === this.state.selectedId) ?? null;
			return clone({
				schemaVersion: 1,
				revision: this.revision,
				capacity: this.state.capacity,
				usedSlots: items.length,
				coins: this.state.walletCoins + this.rewards.snapshot().coins,
				items,
				visible,
				equipment,
				equipmentStats,
				selectedId: this.state.selectedId,
				selected,
				query: this.state.query,
				category: this.state.category,
				sort: this.state.sort,
				rewards: this.rewards.snapshot()
			});
		}
		setQuery(query) {
			requireValue(text(query), "invalid_args", "搜索词必须为不超过200字符的字符串");
			this.state.query = query;
			this.changed();
		}
		setCategory(category) {
			requireValue(categories.includes(category), "invalid_args", "分类无效");
			this.state.category = category;
			this.changed();
		}
		setSort(sort) {
			requireValue(sorts.includes(sort), "invalid_args", "排序无效");
			this.state.sort = sort;
			this.changed();
		}
		select(id) {
			requireValue(id === null || this.state.items.some((item) => item.id === id) || Object.values(this.state.equipment).some((item) => item?.id === id), "item_not_found", "选择目标不存在");
			this.state.selectedId = id;
			this.changed();
		}
		use(id) {
			const item = this.bagItem(id), definition = catalog.get(item.kind);
			requireValue(definition.type === "consumable", "not_consumable", "只有消耗品可以使用");
			this.removeOne(item, 1);
			this.changed();
			return {
				id,
				quantity: 1,
				message: `使用了 ${definition.name} ×1`
			};
		}
		equip(id) {
			const item = this.bagItem(id), definition = catalog.get(item.kind);
			requireValue(definition.type === "equipment" && definition.slot, "not_equipment", "此道具无法装备");
			const slot = definition.slot, previous = this.state.equipment[slot];
			this.state.items = this.state.items.filter((value) => value.id !== id);
			if (previous) this.state.items.push(previous);
			this.state.equipment[slot] = item;
			this.state.selectedId = id;
			this.changed();
			return {
				id,
				slot,
				returnedId: previous?.id ?? null,
				message: `已装备 ${definition.name}`
			};
		}
		unequip(slot) {
			requireValue(EQUIPMENT_SLOTS.includes(slot), "invalid_args", "装备槽无效");
			const item = this.state.equipment[slot];
			requireValue(item, "slot_empty", "此装备槽为空");
			requireValue(this.state.items.length < this.state.capacity, "bag_full", "背包已满，无法卸下装备");
			this.state.items.push(item);
			this.state.equipment[slot] = null;
			this.changed();
			return {
				id: item.id,
				slot,
				message: `已卸下 ${catalog.get(item.kind).name}`
			};
		}
		sell(id, quantity) {
			const item = this.bagItem(id), definition = catalog.get(item.kind);
			requireValue(definition.type !== "quest", "quest_item", "任务道具禁止出售");
			requireValue(Number.isSafeInteger(quantity) && quantity > 0 && quantity <= item.quantity, "invalid_quantity", "出售数量必须为库存范围内的正整数");
			const earned = definition.price * quantity;
			requireValue(Number.isSafeInteger(earned) && Number.isSafeInteger(this.state.walletCoins + this.rewards.snapshot().coins + earned), "coin_overflow", "金币超出安全整数范围");
			this.removeOne(item, quantity);
			this.state.walletCoins += earned;
			this.changed();
			return {
				id,
				quantity,
				earned,
				message: `出售 ${definition.name} ×${quantity}，获得 ${earned} 金币`
			};
		}
		setRewardQuery(query) {
			requireValue(text(query), "invalid_args", "奖励搜索词无效");
			this.rewards.setQuery(query);
			this.state.rewards.query = query;
			this.changed();
		}
		progress() {
			this.rewards.progress();
			this.state.rewards.progressed = true;
			this.changed();
			return { message: "奖励进度已更新" };
		}
		claim(id) {
			requireValue(Number.isSafeInteger(this.state.walletCoins + this.rewards.snapshot().coins + 10), "coin_overflow", "金币超出安全整数范围");
			const result = this.rewards.claim(id);
			requireValue(result.ok, "claim_rejected", result.message);
			this.state.rewards.claimedIds.push(id);
			this.changed();
			return result;
		}
		save() {
			return JSON.stringify(this.state);
		}
		load(json) {
			requireValue(typeof json === "string" && json.length <= 1e5, "invalid_save", "存档必须为不超过100KB的JSON文本");
			let input;
			try {
				input = JSON.parse(json);
			} catch {
				throw new InventoryError("invalid_save", "存档不是有效JSON");
			}
			requireValue(record(input), "invalid_save", "存档必须是对象");
			keys(input, [
				"schemaVersion",
				"capacity",
				"walletCoins",
				"items",
				"equipment",
				"selectedId",
				"query",
				"category",
				"sort",
				"rewards"
			]);
			requireValue(input.schemaVersion === 1, "invalid_save", "不支持此存档版本");
			requireValue(Number.isInteger(input.capacity) && Number(input.capacity) >= 1 && Number(input.capacity) <= 120, "invalid_save", "容量必须为1..120");
			requireValue(Number.isSafeInteger(input.walletCoins) && Number(input.walletCoins) >= 0, "invalid_save", "钱包金币必须为非负安全整数");
			requireValue(Array.isArray(input.items) && input.items.length <= Number(input.capacity), "invalid_save", "背包容量超限");
			const items = input.items.map(stored);
			requireValue(record(input.equipment), "invalid_save", "装备表必须为对象");
			keys(input.equipment, EQUIPMENT_SLOTS);
			const equipment = emptyEquipment();
			for (const slot of EQUIPMENT_SLOTS) {
				const value = input.equipment[slot];
				if (value !== null) {
					const item = stored(value);
					requireValue(catalog.get(item.kind).slot === slot, "invalid_save", "装备槽与道具不符");
					equipment[slot] = item;
				}
			}
			const all = [...items, ...Object.values(equipment).filter((item) => item !== null)];
			requireValue(new Set(all.map((item) => item.id)).size === all.length, "invalid_save", "存在重复道具ID");
			requireValue(input.selectedId === null || typeof input.selectedId === "string" && all.some((item) => item.id === input.selectedId), "invalid_save", "选择目标无效");
			requireValue(text(input.query) && typeof input.category === "string" && categories.includes(input.category) && typeof input.sort === "string" && sorts.includes(input.sort), "invalid_save", "搜索或筛选参数无效");
			requireValue(record(input.rewards), "invalid_save", "奖励状态必须是对象");
			keys(input.rewards, [
				"progressed",
				"claimedIds",
				"query"
			]);
			requireValue(typeof input.rewards.progressed === "boolean" && text(input.rewards.query) && Array.isArray(input.rewards.claimedIds) && input.rewards.claimedIds.length <= 30, "invalid_save", "奖励状态字段无效");
			const claimedIds = input.rewards.claimedIds;
			requireValue(claimedIds.every((id) => typeof id === "string") && new Set(claimedIds).size === claimedIds.length, "invalid_save", "奖励领取ID无效或重复");
			const rewards = new Inventory(30);
			if (input.rewards.progressed) rewards.progress();
			for (const id of claimedIds) requireValue(rewards.claim(id).ok, "invalid_save", `奖励记录不可复放: ${id}`);
			rewards.setQuery(input.rewards.query);
			requireValue(Number.isSafeInteger(Number(input.walletCoins) + rewards.snapshot().coins), "invalid_save", "合计金币溢出");
			const next = {
				schemaVersion: 1,
				capacity: Number(input.capacity),
				walletCoins: Number(input.walletCoins),
				items,
				equipment,
				selectedId: input.selectedId,
				query: input.query,
				category: input.category,
				sort: input.sort,
				rewards: {
					progressed: input.rewards.progressed,
					claimedIds: [...claimedIds],
					query: input.rewards.query
				}
			};
			this.state = next;
			this.rewards = rewards;
			this.changed();
			return { message: "背包状态已载入" };
		}
	};
	//#endregion
	//#region 验证/unity-migration/complex-inventory/shared/index.ts
	function createComplexInventoryApp() {
		const inventory = new ComplexInventory();
		let open = false, release = null, notifications = 0, opens = 0, closes = 0, closedCallbacks = 0;
		const response = (op, ok = true, result = null, error) => JSON.stringify({
			ok,
			op,
			result,
			error: error?.message ?? null,
			errorCode: error?.code ?? null,
			view: inventory.snapshot(),
			session: {
				open,
				listenerCount: inventory.listenerCount,
				notifications,
				opens,
				closes,
				closedCallbacks,
				listenerErrors: inventory.listenerErrorCount
			}
		});
		const requireString = (args, key) => {
			if (typeof args[key] !== "string") throw new InventoryError("invalid_args", `${key} 必须为字符串`);
			return args[key];
		};
		return {
			snapshot: () => response("snapshot"),
			dispatch(op, argsJson = "{}") {
				let args;
				try {
					args = JSON.parse(argsJson);
				} catch {
					return response(op, false, null, {
						code: "invalid_json",
						message: "参数不是有效JSON"
					});
				}
				if (!args || typeof args !== "object" || Array.isArray(args)) return response(op, false, null, {
					code: "invalid_args",
					message: "参数必须为JSON对象"
				});
				try {
					let result = null;
					switch (op) {
						case "snapshot": break;
						case "open":
							if (!open) {
								open = true;
								release = inventory.subscribe(() => {
									if (open) notifications++;
									else closedCallbacks++;
								});
								opens++;
							}
							break;
						case "close":
							if (open) {
								release?.();
								release = null;
								open = false;
								closes++;
							}
							break;
						case "query":
							inventory.setQuery(requireString(args, "query"));
							break;
						case "category":
							inventory.setCategory(requireString(args, "category"));
							break;
						case "sort":
							inventory.setSort(requireString(args, "sort"));
							break;
						case "select":
							inventory.select(args.id === null ? null : requireString(args, "id"));
							break;
						case "use":
							result = inventory.use(requireString(args, "id"));
							break;
						case "equip":
							result = inventory.equip(requireString(args, "id"));
							break;
						case "unequip":
							result = inventory.unequip(requireString(args, "slot"));
							break;
						case "sell":
							result = inventory.sell(requireString(args, "id"), args.quantity);
							break;
						case "rewardQuery":
							inventory.setRewardQuery(requireString(args, "query"));
							break;
						case "progress":
							result = inventory.progress();
							break;
						case "claim":
							result = inventory.claim(requireString(args, "id"));
							break;
						case "save":
							result = { json: inventory.save() };
							break;
						case "load":
							result = inventory.load(requireString(args, "json"));
							break;
						default: throw new InventoryError("unknown_operation", `未知操作: ${String(op)}`);
					}
					return response(op, true, result);
				} catch (error) {
					return response(op, false, null, {
						code: error instanceof InventoryError ? error.code : "internal_error",
						message: error instanceof Error ? error.message : String(error)
					});
				}
			}
		};
	}
	//#endregion
	//#region 验证/unity-migration/complex-inventory/shared/entry.ts
	var g = globalThis;
	if (!g.complexInventoryApp) g.complexInventoryApp = createComplexInventoryApp();
	//#endregion
})();

