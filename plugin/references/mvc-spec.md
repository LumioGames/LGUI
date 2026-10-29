# MVC 开发规范

写功能代码时照这份规范做。游戏代码用 TypeScript，只 `import` 自 `lgui`（框架）和 `lgui/ui`（由 `ui/` 生成的控件类型），不直接用 `document`、`window`、`CS.` 这类引擎或平台的 API。这样网页和 Unity 用同一份代码。

## 1. 写功能的固定步骤

1. `lgui new module <名字>` 生成 Model、Controller 和测试的骨架；要连界面和 View 一起生成，加 `--pattern <模式>`（见 UI 开发规范第 7.4 节）。给已有模块加界面用 `lgui new view <包>/<组件> --pattern <模式>`。
2. 在 Model 里写数据和规则，在 Controller 里写操作，在 View 里写绑定表。
3. `lgui check`：类型检查和本规范的检查规则，把报错全部改掉。
4. `lgui test`：用 headless 后端在 Node 里跑测试。
5. `lgui dev` 预览，`lgui verify` 截图看一遍。

## 2. 目录和文件

```
src/
├── main.ts                       # 入口：选后端、注册服务、打开第一个界面
└── modules/
    └── bag/                      # 一个功能一个文件夹，小写
        ├── BagModel.ts           # 数据和规则
        ├── BagView.ts            # 一个界面一个文件；列表子项、部件 View 各自一个文件
        ├── ItemSlotView.ts
        ├── BagController.ts      # 处理操作
        └── BagService.ts         # 跟服务器打交道（需要时才有）
tests/
└── bag.test.ts                   # 测试，用 headless 后端
```

- 文件名 = 导出的类名或对象名的大写形式：`BagModel.ts` 导出 `bagModel`，`BagView.ts` 导出 `BagView`，`BagController.ts` 导出 `BagController` 和 `bagController`。
- 一个文件只写一个 View。

## 3. 角色和调用规则

| 角色 | 负责什么 | 可以调用 | 不可以 |
|---|---|---|---|
| Model | 数据和规则 | 纯逻辑代码 | 依赖界面、服务、平台 |
| View | 对应 `ui/` 里的一个组件，只负责显示和转发操作 | Controller；只读 Model | 修改 Model；访问服务和网络 |
| Controller | 处理操作：修改 Model、调用服务、打开或关闭界面 | Model、服务、`lgui.ui` | 直接操作控件 |
| Service | 向服务器发请求，接收服务器推送 | 平台服务（`lgui.platform.net`） | 操作界面 |

这些规则都由 `lgui check` 检查（第 13 节）。

## 4. 入口 `main.ts`

```ts
import { lgui } from 'lgui';
import { MainView } from './modules/main/MainView';
import { RealBagService } from './modules/bag/BagService';

export default lgui.app({
  backend: 'h5',                                   // 默认后端；lgui test 换成 headless，导出 Unity 时换成 unity
  services: { bag: () => new RealBagService() },   // 注册服务
  async start() {
    await lgui.ui.open(MainView);                  // 打开第一个界面
  },
});
```

## 5. Model

```ts
// src/modules/bag/BagModel.ts
import { lgui } from 'lgui';

export interface Item { id: string; name: string; count: number; iconUrl: string }

export const bagModel = lgui.Model(
  { gold: 0, items: [] as Item[], selectedId: null as string | null, tab: 'equip' as 'equip' | 'item' },
  (set, get) => ({
    select(id: string) { set({ selectedId: id }); },
    removeSelected() {
      const { items, selectedId } = get();
      set({ items: items.filter(it => it.id !== selectedId), selectedId: null });
    },
  }),
);
```

- `lgui.Model(初始数据, 规则?)`：`get()` 读当前数据；`set(部分字段)` 只改给出的字段；规则函数返回的方法直接挂在 Model 上（`bagModel.removeSelected()`）。
- 界面不需要知道 Model 怎么存，只用 `pick` 读。
- 只有 Model 自己的规则和 Controller 能调用 `set` 和规则方法。

## 6. View 和绑定表

```ts
// src/modules/bag/BagView.ts
import { View, pick, format } from 'lgui';
import type { Bind, Keys } from 'lgui';
import type { BagPanelUI } from 'lgui/ui';
import { bagModel } from './BagModel';
import { bagController } from './BagController';
import { ItemSlotView } from './ItemSlotView';
import { CurrencyBarView } from '../common/CurrencyBarView';

export class BagView extends View<BagPanelUI> {
  static component = 'Bag/BagPanel';
  static layer = 'page' as const;
  static fullScreen = true;
  static params: { tab?: 'equip' | 'item' } = {};

  bind: Bind<BagPanelUI> = {
    gold:       { text: pick(bagModel, s => s.gold, format.number) },
    emptyTip:   { visible: pick(bagModel, s => s.items.length === 0) },
    tabs:       { page: pick(bagModel, s => s.tab), change: tab => bagController.switchTab(tab) },
    list:       { items: pick(bagModel, s => s.items), item: ItemSlotView, key: (it: BagItem) => it.id,
                  selected: pick(bagModel, s => s.selectedId), select: id => bagController.select(id) },
    sellButton: { enabled: pick(bagModel, s => s.selectedId !== null),
                  click: () => bagController.sell(), lockWhilePending: true },
    sellingTip: { visible: pick(bagController.sellRequest, r => r.status === 'pending') },
    salvage:    { hold: { ms: 1000, action: () => bagController.salvage() } },
    equipTab:   { redDot: 'bag.equip' },
    'header.count': { text: pick(bagModel, s => s.items.length, format.number) },
    topBar:     { view: CurrencyBarView },
    keyHint:    { visibleOn: ['keyboardMouse'] },
  };
  keys: Keys = { back: 'close', confirm: { do: () => bagController.sell(), hint: 'bag.sell' } };
}
```

### 6.1 三种 View

| 基类 | 用于 | static |
|---|---|---|
| `View<组件UI>` | 一个界面（放在某一层） | 见 6.2 |
| `ItemView<组件UI, 数据>` | 列表的子项 | 只写 `component` |
| `PartView<组件UI>` | 好几个界面共用的部件（货币栏），跟着所在界面一起打开和关闭 | 只写 `component` |

`组件UI` 类型从 `lgui/ui` 引入，名字是组件名加 `UI`（`BagPanel` → `BagPanelUI`）。

**两处固定写法：**

- 绑定表一定写类型：`View` 写 `bind: Bind<组件UI> = {…}`，`ItemView` 写 `bind: ItemBind<组件UI, 数据> = {…}`，`PartView` 写 `bind: Bind<组件UI> = {…}`；按键表写 `keys: Keys = {…}`。不写类型时，TypeScript 查不出写错的键名。
- `static layer` 写成 `static layer = 'page' as const;`。

### 6.2 View 的 7 项 static

| 项 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `component` | 是 | — | `'<包>/<组件>'`，横版组件名，竖版由框架自动找 `@portrait` |
| `layer` | 是 | — | `'hud' \| 'page' \| 'popup' \| 'modal' \| 'toast'` |
| `fullScreen` | 否 | `false` | 是不是全屏 |
| `params` | 否 | 不收参数 | 打开时能传的参数，写成带默认值的对象 |
| `result` | 否 | 不交回 | 关闭时可以顺带交回什么，只写类型：`static result: { itemId: string };` |
| `inputMode` | 否 | `hud` 层是 `'game'`，其余是 `'ui'` | `'ui'`：只有界面收输入；`'game'`：只有游戏场景收；`'all'`：两边都收 |
| `bothOrientations` | 否 | `false` | 全屏界面没有竖版时写 `true`，表示两种方向共用这一版 |

写了表外的 static，`lgui check` 报 `LGUI-MVC-003`。

### 6.3 绑定表的键

- 控件名，或者控制器名（控制器只能用 `page` 和 `change`）。
- 只在这个界面里出现的子组件里的控件：用「.」连起来，`'header.count'`。
- 好几个界面共用的子组件：做成 `PartView`，写 `topBar: { view: CurrencyBarView }`。
- 键名和控件类型由 `ui/` 生成，写错编译就报错。

### 6.4 词表

| 词 | 用在 | 值 | 例子 |
|---|---|---|---|
| `text` | 文字、按钮标题、`ArtText` | `pick`（不写固定字符串：固定文字放在 `ui/` 里） | `text: pick(bagModel, s => s.gold, format.number)` |
| `visible` | 任意控件 | 布尔 | `visible: pick(bagModel, s => s.items.length === 0)` |
| `enabled` | 任意控件 | 布尔；`false` 时变灰、不可点 | `enabled: pick(bagModel, s => s.selectedId !== null)` |
| `icon` | 加载器、按钮图标 | 图片地址 | `icon: it => it.iconUrl` |
| `progress` | 进度条 | 0–100 | `progress: pick(taskModel, s => s.percent)` |
| `page` | 控制器 | 页名 | `page: pick(bagModel, s => s.tab)` |
| `redDot` | 有 `redDot` 子控件的控件 | 红点路径 | `redDot: 'bag.equip'` |
| `items` | 列表 | 数组 | `items: pick(bagModel, s => s.items)` |
| `item` | 列表 | 子项的 `ItemView` 类 | `item: ItemSlotView` |
| `key` | 列表 | 认出同一项的函数（参数要写上这一项的类型） | `key: (it: BagItem) => it.id` |
| `selected` | 列表 | 选中项的 key | `selected: pick(bagModel, s => s.selectedId)` |
| `view` | 子组件 | `PartView` 类 | `view: CurrencyBarView` |
| `click` / `doubleClick` | 任意控件 | 调用 Controller 方法 | `click: () => bagController.sell()` |
| `hold` | 任意控件 | `{ ms, action }`，按满才执行 | `hold: { ms: 1000, action: () => bagController.salvage() }` |
| `drag` / `swipe` / `pinch` / `wheel` / `hover` | 任意控件 | 收到手势参数，调用 Controller 方法 | `swipe: e => mapController.pan(e.dx, e.dy)` |
| `change` | 控制器 | 用户切页时调用 | `change: tab => bagController.switchTab(tab)` |
| `select` | 列表 | 用户点选时调用，参数是 key | `select: id => bagController.select(id)` |
| `lockWhilePending` | 有 `click` 的控件 | `true`：动作返回的 Promise 结束前保持锁住 | `lockWhilePending: true` |
| `visibleOn` | 任意控件 | 只在这些输入类型下显示 | `visibleOn: ['keyboardMouse']` |
| `placeholder` | 加载器 | 加载中和失败时显示的图，不写用工程配置的默认占位图 | `placeholder: 'ui://Bag/iconLoading'` |

- **显示类的值只有两种写法：** 固定值，或 `pick(数据, 取字段, 格式化?)`。`ItemView` 里写成函数：传入这一项的数据，返回要显示的内容。
- **动作类只调用 Controller 的方法**，一句话写完，View 里不写业务逻辑。
- **点击和手势绑在能接收输入的控件上：** 按钮、组件、列表、有填充的图形。文字、富文本、图片自己收不到点击（FairyGUI 的各个运行时都这样），绑上去不会触发；`lgui test` 里点它们报 `LGUI-RT-032`。
- **绑定表里不写死用户能看到的文字。** 固定文字放在 `ui/` 里，动态文字用 `lgui.t`。
- **没写进绑定表的控件，代码里一律不碰。** 特殊情况用生命周期钩子（第 9 节），钩子里用 `this.ui.<控件名>`；但不在钩子里改控件属性（`this.ui.title.visible = false`）：旋转、换语言重建组件后改的值就没了，`lgui check` 警告 `LGUI-MVC-020`。要显示的东西都写进绑定表。
- **不写坐标和尺寸。**

### 6.5 `pick`

`pick(来源, 取字段, 格式化?)`：来源可以是 Model、`lgui.request` 包好的请求，或者任何有 `get` 和 `subscribe` 的东西。数据一变就重新取值，取出的值没变（`Object.is`）就不刷新，所以只改金币时，监听道具列表的控件不会重画。订阅在界面关闭时自动取消。

## 7. Controller

```ts
// src/modules/bag/BagController.ts
import { lgui, Controller } from 'lgui';
import { bagModel } from './BagModel';
import type { BagService } from './BagService';

const bagService = lgui.service<BagService>('bag');

export class BagController extends Controller {
  sellRequest = lgui.request((id: string) => bagService.sell(id));

  select(id: string) { bagModel.select(id); }
  switchTab(tab: 'equip' | 'item') { bagModel.set({ tab }); }

  async sell() {
    const id = bagModel.get().selectedId;
    if (!id || !(await lgui.confirm({ title: 'bag.sellTitle', message: 'bag.sellAsk' }))) return;
    const r = await this.sellRequest.run(id);
    if (r.ok) {
      bagModel.removeSelected();
      lgui.toast('bag.sold', { count: 1 });
    }
  }
}
export const bagController = new BagController();
```

- `lgui.request(函数)` 把一个请求包一层，返回请求对象：
  - `run(...参数)` 返回 `{ ok, value, error }`；状态依次变成 `pending` → `succeeded` 或 `failed`，没跑过时是 `idle`；
  - 超时按工程配置 `requestTimeoutMs`（默认 10 秒），报 `LGUI-RT` 错误码；
  - 失败时，工程配置 `requestErrorToast` 为 `true`（默认）时自动弹出统一的错误提示；
  - 界面用 `pick(bagController.sellRequest, r => r.status === 'pending')` 读状态。
- Controller 不能碰控件。
- `await` 之后要关界面、换界面时，目标界面已经关了，框架就跳过并记一条日志。

## 8. Service

```ts
// src/modules/bag/BagService.ts
import { lgui } from 'lgui';

export interface BagService {
  sell(id: string): Promise<{ gold: number }>;
}

// 真实实现：通过平台服务发请求
export class RealBagService implements BagService {
  async sell(id: string) {
    const res = await lgui.platform.net.fetch(`/api/bag/sell?id=${encodeURIComponent(id)}`, { method: 'POST' });
    return (await res.json()) as { gold: number };
  }
}

// 测试用的假实现
export class FakeBagService implements BagService {
  async sell() { return { gold: 100 }; }
}
```

- 先写接口，再写真实实现和假实现。`main.ts` 注册真实实现，测试里注册假实现。
- Controller 用 `lgui.service<接口>('名字')` 拿服务，不直接 `new`。
- 服务器推送：Service 用 `lgui.defineEvent` 声明事件并广播，Controller 收听后改 Model。

## 9. 生命周期钩子

钩子都是可选的，写在 View 上。钩子里注册的监听、定时器，都由框架在关闭时自动清理。

| 钩子 | 什么时候 |
|---|---|
| `onOpen(params)` | 界面打开，资源准备好、绑定完成之后 |
| `onActivate()` / `onDeactivate()` | 变成激活的界面时 / 被别的界面压住时 |
| `onCovered()` / `onRevealed()` | 被全屏界面盖住时 / 重新露出来时 |
| `onOrientationChange(orientation)` | 屏幕方向变了，只在特殊情况用 |
| `onClose()` | 界面关闭前 |

**顺序：**

- 打开：加载资源 → 创建 → 绑定 → `onOpen` → `onActivate`
- 被压住：`onDeactivate`
- 关闭：`onDeactivate`（如果当时是激活的）→ `onClose` → 解绑和清理 → 销毁或缓存 → 释放资源

屏幕旋转、切换语言时，View 实例保留，只重建组件，不调用 `onOpen` 和 `onClose`。所以钩子里不写控件属性，只写绑定表（`lgui check` 警告 `LGUI-MVC-020`）。

## 10. UIManager：`lgui.ui`

| 写法 | 作用 |
|---|---|
| `lgui.ui.open(BagView, { tab: 'equip' })` | 压栈打开，返回 Promise；参数类型来自 `static params` |
| `lgui.ui.open(PickerView, { slot: 'weapon' }, { onClose: picked => … })` | 打开，并在它关闭时通知打开它的一方 |
| `lgui.ui.replace(ShopView)` | 替换当前栈顶 |
| `lgui.ui.close(BagView)` / `lgui.ui.close(PickerView, { itemId })` | 关闭；可以顺带交回 `static result` 声明的东西 |
| `lgui.ui.back()` | 和按返回键一样 |
| `lgui.ui.popTo(MainView)` | 一直关到指定界面 |
| `lgui.ui.closeAll('popup')` | 关闭某一层的全部界面 |
| `lgui.ui.isOpen(V)`、`get(V)`、`top(层?)`、`list(层)` | 查询 |
| `lgui.ui.find('Bag/BagPanel.sellButton')` | 控件在设计尺寸下的位置和大小，只读 |

- 5 层从下到上：`hud`、`page`、`popup`、`modal`、`toast`。`hud`、`page`、`popup` 各是一个栈；`modal` 是队列，同一时间只显示一个；`toast` 不收输入。
- 所有层合起来最上面那个界面是激活的，只有它收输入。
- 打开全屏界面时，下面的界面都被盖住（隐藏、暂停定时器和动效）；关掉后自动露出来。
- `page` 层最底下的主界面按返回键关不掉。
- **`onClose`：** B 不管怎么关（自己关、返回键、`closeAll`、`replace`）都调用一次；没交回东西时参数是 `undefined`；打开 B 的界面先关了，回调自动取消；旋转、换语言不算关闭。
- 一个模块不能去改另一个界面的控件；要改就改它监听的 Model。

### 10.1 返回键和按键动作

```ts
keys: Keys = {
  back: 'close',                                                  // 'close' 关闭自己（默认）；'none' 不让返回；或者写一个函数
  confirm: { do: () => bagController.sell(), hint: 'bag.sell' },  // hint 是文本键，显示在操作提示栏
};
```

- 默认映射：`Escape`、安卓返回键 → `back`；`Enter` → `confirm`。工程配置 `keyMap` 可以按平台改写。
- 不带 `hint` 的动作不进操作提示栏，返回键例外（默认显示「返回」）。

## 11. 常用工具

| 写法 | 作用 |
|---|---|
| `lgui.toast('bag.sold', { count })` | 短提示，放在 `toast` 层 |
| `await lgui.confirm({ title, message, ok?, cancel? })` | 确认框，返回 `true` / `false`；参数都是文本键 |
| `lgui.loading.show()` / `hide()` | 加载中，按次数计数，最后一次 `hide` 才消失 |
| `lgui.redDot.set('bag.newItem', true \| false \| 3)` | 红点；上层路径自动汇总，数字显示合计 |
| `lgui.t('bag.sold', { count })` | 取文本，占位符写成 `{count}` |
| `format.number(n)`、`format.date(d)`、`format.currency(n, 'CNY')` | 按当前语言格式化 |
| `lgui.setLanguage('en')` | 切换语言，已打开的界面自动重建 |
| `lgui.time.now()`、`lgui.time.setServerOffset(毫秒)` | 当前时间（和服务器对齐） |
| `await lgui.time.wait(毫秒)` | 等一段时间（Service 模拟延迟、重试间隔用；界面上的定时器用 View 的 `this.after`） |

**文本表 `i18n/<语言>.json`：** 扁平的「键 → 文字」，键名是可读的点号键。要按数量变化的文字，值写成按复数形式分开的对象，用参数 `count` 选（形式名和 `Intl.PluralRules` 一致；中文、日文、韩文只写 `other`）：

```json
{
  "bag.sold": "已售出 {count} 件",
  "bag.items": { "one": "{count} item", "other": "{count} items" }
}
```

找不到键时，界面上显示键名，并记一条 `LGUI-RT-090` 日志。启动时的语言：系统语言里第一个工程支持的，都不支持就用 `defaultLanguage`。

**定时器**（写在 View 里用 `this.`，跟着界面走：被盖住时暂停，关闭时取消）：

```ts
onOpen() {
  this.after(500, () => …);                       // 延时一次
  this.every(1000, () => …);                      // 重复
  this.countdown(eventModel.get().endsAt, left => eventController.tick(left), () => eventController.end());
  this.onUpdate(dt => …);                         // 每帧
}
```

倒计时每次都按「结束时间 − 现在」算，切到后台再回来也不会走偏。

回调出错时，错误照常报出来（网页上是页面里未捕获的错误，`lgui test` 里这个测试失败），但不影响别的定时器和以后的帧；`after` 和倒计时的结束回调出错也只执行这一次。

**广播站：**

```ts
// 声明（放在发事件的模块里）
export const rewardClaimed = lgui.defineEvent<{ id: string }>('rewardClaimed');
// 发
lgui.emit(rewardClaimed, { id });
// 收（View 里关闭时自动取消；Controller、Service 里跟着整个游戏走）
this.on(rewardClaimed, e => …);
this.on(lgui.events.viewClosed, e => { if (e.view === ShopView) bagController.reload(); });
```

框架自己的事件在 `lgui.events` 下：`viewOpened`、`viewClosed`、`viewCovered`、`viewRevealed`、`orientationChange`、`languageChange`、`inputTypeChange`、`inputModeChange`。

要显示的数据放 Model；「发生了一件事」用广播站；只有打开它的界面需要知道的，用 `onClose`。

## 12. 测试

```ts
// tests/bag.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lgui } from 'lgui';
import app from '../src/main';
import { FakeBagService } from '../src/modules/bag/BagService';
import { BagView } from '../src/modules/bag/BagView';

test('选中道具后出售，金币增加', async () => {
  const t = await lgui.testing.start(app, { services: { bag: () => new FakeBagService() } });
  await t.open(BagView);
  await t.click('Bag/BagPanel.list[0]');           // 列表第 1 项
  await t.click('Bag/BagPanel.sellButton');
  await t.click('Common/Confirm.ok');
  assert.equal(t.text('Bag/BagPanel.gold'), '100');
  t.end();
});
```

`lgui.testing.start(app, 选项?)` 用 headless 后端和假时钟启动，返回的对象有：

| 方法 | 作用 |
|---|---|
| `open(View, 参数?)` | 打开界面 |
| `click(路径)`、`hold(路径, 毫秒)`、`drag(路径, dx, dy)`、`swipe(路径, dx, dy)`、`pinch(路径, 比例)`、`wheel(路径, dy)`、`key(按键名)` | 模拟操作 |
| `text(路径)`、`visible(路径)`、`enabled(路径)`、`page(路径)`、`items(路径)` | 读控件属性：文字（字符串）、显示 / 可用（布尔）、控制器当前页（页名）、列表项数（数字） |
| `setScreen(宽, 高)`、`setLanguage(语言)`、`setInputType('touch' \| 'keyboardMouse')` | 模拟旋转、换语言、换输入设备 |
| `advance(毫秒)` | 让假时钟往前走 |
| `snapshot()` | 返回 `lgui.debug.snapshot()` |
| `end()` | 关闭所有界面，检查监听和定时器都已清理 |

路径写成 `<包>/<组件>.<控件路径>`；列表子项用 `list[序号]`。

- **假时钟：** 点了按钮以后，打开新界面、请求返回都要等一帧，先 `await t.advance(16)` 再读；一串请求就多等几帧。
- **整个文件没跑起来也算失败：** 测试文件加载时出错（顶层抛错、import 失败）或者测试结束后还有没处理的错误，`lgui test` 把这个文件记为失败（失败项是 `tests/` 里的文件名）。
- **Model 在测试之间不重置**（同一个测试文件里的测试共用一份）：给 Model 加一个 `reset()` 规则，在 `beforeEach` 里调用：

```ts
import { test, beforeEach } from 'node:test';
beforeEach(() => bagModel.reset());
```

## 13. 检查规则表

`lgui check` 用语法树检查，不靠字符串匹配。报错格式：`文件:行:列  错误码  说明  → 怎么改`。

| 错误码 | 规则 | 正确写法 | 错误写法 |
|---|---|---|---|
| `LGUI-MVC-001` | 游戏代码只 import `lgui`、`lgui/ui` 和工程内的相对路径；不用 `document`、`window`、`globalThis`、`CS`、`localStorage`、`fetch` 等平台全局对象（工程里自己声明的同名变量、参数不算） | `lgui.platform.net.fetch(…)` | `fetch(…)`、`document.body` |
| `LGUI-MVC-002` | View 写了必填的 `component` 和 `layer` | `static layer = 'page'` | 没写 `layer` |
| `LGUI-MVC-003` | View 只写 6.2 表里列出的 static；`ItemView`、`PartView` 只写 `component` | — | `static cache = true` |
| `LGUI-MVC-004` | static 的值合法：`layer` 是 5 层之一，`component` 是存在的导出组件，`inputMode` 是 `ui`/`game`/`all`，`music` 是登记在 `ui/` 里的 mp3 音效（`ui://包名/音效名`） | `static layer = 'popup'`、`static music = 'ui://Bag/bgm'` | `static layer = 'dialog'`、`static music = 'bgm.mp3'` |
| `LGUI-MVC-005` | 绑定表的键是组件里真实存在的控件、控制器、动效或点号路径 | `'header.count'` | `'header.cnt'` |
| `LGUI-MVC-006` | 绑定表只用词表里的词；控制器只用 `page`、`change`；动效只用 `playing`、`play`、`done` | `{ text: … }` | `{ label: … }`、控制器上写 `visible` |
| `LGUI-MVC-007` | View 里显示类的值是固定值或 `pick(…)`；`ItemView` 里是函数 | `pick(bagModel, s => s.gold)` | `bagModel.get().gold` |
| `LGUI-MVC-008` | 动作类的值只调用一个 Controller 方法 | `() => bagController.sell()` | `() => { bagModel.set(…) }` |
| `LGUI-MVC-009` | View 不改 Model | — | View 里调用 `bagModel.set` 或规则方法 |
| `LGUI-MVC-010` | View 不访问服务和网络 | — | View 里调用 `lgui.service`、`lgui.platform.net` |
| `LGUI-MVC-011` | Controller 不碰控件 | 改 Model | Controller 里用 `lgui.ui.get(BagView).ui.gold` |
| `LGUI-MVC-012` | Model 不依赖界面、服务、平台 | 纯逻辑 | Model 里 import View 或调用 `lgui.ui` |
| `LGUI-MVC-013` | Service 不操作界面 | 广播事件 | Service 里调用 `lgui.ui.open`、`lgui.toast` |
| `LGUI-MVC-014` | 不写死用户能看到的文字：绑定表的 `text` 不写固定字符串（固定文字放在 `ui/` 里，动态文字用 `pick(…, lgui.t(键))`）；`lgui.toast` / `lgui.confirm` 的参数是文本键 | `lgui.toast('bag.sold')`、`text: pick(bagModel, s => lgui.t('bag.gold', { n: s.gold }))` | `lgui.toast('已售出')`、`text: '金币'`、`text: 'bag.title'` |
| `LGUI-MVC-015` | 代码里不写坐标和尺寸 | 在 `ui/` 里用关联 | `this.ui.list.width = 800` |
| `LGUI-MVC-016` | 全屏界面要么有 `@portrait` 竖版，要么写 `static bothOrientations = true` | 有 `BagPanel@portrait` | 全屏、没竖版、也没写 `bothOrientations` |
| `LGUI-MVC-017` | 文件位置和命名照第 2 节；一个文件只写一个 View | `src/modules/bag/BagView.ts` | 一个文件里写两个 View |
| `LGUI-MVC-018`（警告） | 不跨界面修改控件 | 改 Model | `lgui.ui.get(ShopView)` 之后改它的控件 |
| `LGUI-MVC-019` | `keys` 表：`back` 是 `'close'`、`'none'` 或函数；其他动作是 `{ do, hint? }`，`hint` 是文本键 | `confirm: { do: …, hint: 'bag.sell' }` | `confirm: 'sell'` |
| `LGUI-MVC-020`（警告） | View 里不直接改控件属性（坐标尺寸归 `LGUI-MVC-015`）：旋转、换语言重建组件后改的值就没了 | 绑定表 `title: { visible: pick(…) }` | 钩子里写 `this.ui.title.visible = false` |

TypeScript 自己的类型错误也一起报出来（带 TS 的错误码）。靠人看、机器查不出的：Model 的规则写得对不对、交互是否顺手。
