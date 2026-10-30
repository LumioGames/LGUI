# 背包示例

用 LGUI 写的完整小游戏界面：营地、背包、商店、领奖。用到了框架的每一项功能，也是 `lgui check`、`lgui test`、`lgui verify` 的参照工程。

## 跑起来

在仓库里先把框架复制进示例（框架副本不进 git）：

```bash
node scripts/sync-examples.mjs
```

然后在 `examples/inventory/` 里：

```bash
node ../../plugin/tools/lgui.mjs dev
```

`check`、`test`、`verify` 同理。仓库的 `npm test` 也会跑这个示例的 `lgui check` 和 `lgui test`（`tests/e2e/inventory.test.mjs`）。

## 功能在哪

| 功能 | 在哪 |
|---|---|
| 横竖屏 | `Bag/BagPanel` 和 `@portrait`（左右分栏 ↔ 上下堆叠）；商店、营地、HUD 也各有竖版；详情、选武器、领奖弹窗横竖共用 |
| 绑定表全部写法 | `BagView`：金币、空背包提示、分类控制器、道具列表（`ItemSlotView`）、出售（`lockWhilePending`）、分解（`hold` + `holdProgress`）、触屏提示（`visibleOn`） |
| 部件 View | 货币栏 `CurrencyBarView`，背包和商店共用 |
| 请求状态 | 出售、购买、领奖都用 `lgui.request`；「出售中」「购买中」提示；失败时框架弹出统一的错误提示 |
| 打开和关闭 | 选武器 `ItemPickerView` 关闭时用 `onClose` 交回选中的武器；商店关闭时背包收到 `viewClosed`，选中刚买的道具 |
| 5 层 | hud（场景背景、限时活动倒计时）、page（营地、背包、商店）、popup（详情、选武器）、modal（领奖：「获得道具」「金币到账」排队连着弹）、toast |
| 广播站 | `coinsChanged`（金币飘字）、`rewardClaimed`（背包收到奖励）、`lgui.events.viewClosed` |
| 定时器 | HUD 的限时活动倒计时（`countdown`，被盖住时暂停，回来按结束时间重算）；金币飘字 1.2 秒后消失（`after`） |
| 红点 | 新道具红点，营地的背包入口显示合计；奖励入口显示能领的个数 |
| 多语言 | `zh-CN` 和 `en`；固定文字在 `ui/` 里，动态文字用 `lgui.t`，带字图片 `Bag/title.png` 和 `title@en.png`（装载器 + `icon`） |
| 美术字 | 金币变化时飘出的数字、「金币到账」的数字（`Common/artfont/coin/`） |
| 占位图 | 道具图标是装载器，图片加载前显示工程配置的占位图 |
| 通用弹窗 | 出售、购买前的确认框；操作结果的提示 |
| 操作提示栏 | 「Esc 返回」「Enter 出售」「Enter 收下」 |
| 存储 | 背包存档和恢复（`lgui.platform.storage`），存档坏了就丢掉 |
| 服务 | `InventoryService`：`LocalInventoryService` 在本地模拟服务器的延迟和失败，测试用 `FakeInventoryService` |
| 美术 | 道具图标用 `lgui art split` 从 `ui/art-src/Bag/items-atlas.png` 拆出来；营地背景在 `ui/art-src/Main/backdrop.png` |

## 美术来源

`ui/art-src/` 里的原图是 0.2.0 时用图像生成、裁切和抠图得到的素材，不是 FairyGUI 官方示例资产，按仓库的 [LICENSE](../../LICENSE) 提供；生成提示词记录在 `ui/art-src/prompts.json`。标题字、金币图标和金币美术字是用 SVG 画的。

旧示例（0.2.0）的源文件在 tag `v0.2.0-final` 的 `examples/inventory/legacy/` 里。
