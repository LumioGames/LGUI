# 背包参考图网页还原验证

本目录对应 `http://127.0.0.1:4182/fidelity/`。当前优先验证独立 FairyGUI-dom 网页；较早的 `../web/` 页面会转到这里。

## 运行

在 `complex-inventory` 目录运行：

```powershell
node scripts/serve.mjs
```

服务只监听 `127.0.0.1:4182`。浏览器打开 `/fidelity/`。修改适配层后运行 `node fidelity/build-fidelity.mjs`，再刷新页面。右下角菜单可保存、恢复当前背包；刷新不会自动恢复存档。

## 实现与资源

- `fidelity.ts` / `fidelity.js`：FairyGUI-dom 组件、交互与响应式平台适配。业务入口仍为同一份 `../dist/ComplexInventoryApp.txt`，由构建复制为 `app.js`。
- `reference-fixture.json`：24 类道具、24 个格子、容量 30、金币 12,480 的初始业务存档。
- `layout-reference.json`：1586×992 参考坐标。接近正方形的窗口按用户指定铺满重排，保留美术风格和控件比例。
- `prepare-skin.mjs` / `skin-manifest.json`：参考图拆出的背景、框线、道具格、按钮等资源及来源。游戏页面不加载整幅参考截图作为界面。
- `prepare-detail-icons.mjs` / `detail-icons.json`：透明道具图集的拆分与来源。详情道具与边框、数量分开，保持图片比例。
- 数量、金币、属性、描述和按钮文字为真实控件；装备、使用、出售、筛选、排序、存档、奖励仍经过共享业务入口。

## 复验

```powershell
node fidelity/button-skin.test.mjs
node fidelity/accept-adaptive-controls.mjs
node fidelity/accept-fidelity.mjs
```

原始截图、断言和来源 hash 在 `evidence/`；带时间戳的旧结果保留，不能自动代表当前代码。功能断言通过不等于美术 1:1 已获验收。`compare.html` 仅用于查看参考叠图，游戏本身不使用该叠图。

## 当前边界

当前美术与控件已回写 `../project/Inventory.fairy`，正式新发布位于 `../published/fidelity/`；原发布目录与旧运行证据保留。当前 Unity 原生运行仍待验，不能用先前 Player 结果证明新版外观已通过。

网页目前用 FairyGUI 组件组装，布局已提取为 `layout-shared.js`；Unity 将直接加载同源发布包，并执行同一布局文件和业务文件。正式源回写、发布、运行是不同的验收步骤。
