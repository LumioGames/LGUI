# testbed —— Cocos Creator 3.8.2 测试工程

M1 的验收场。**生成物不进 git**（界面包、框架副本、启动配置），克隆后先跑同步：

```bash
node sync.mjs   # 灌四样：界面包 → assets/lgui-ui/、翻译 → lgui-ui/i18n/、框架 → assets/lgui-framework/、启动配置 → assets/scripts/lgui-config.ts
```

## Funplay MCP（Agent 调试通道）

扩展已装在 `extensions/funplay-cocos-mcp`（本地安装，不进 git）。端口已固定为 `funplay-cocos-mcp.config.json` 里的 27182，ZCode 工作区配置（`.zcode/config.json`）已注册 `funplay-cocos` 服务器。

启用步骤（一次性）：重启 Creator（或扩展管理器里 reload 扩展）→ 菜单 **Funplay > MCP Server** 启用服务器 → 验证 `curl http://127.0.0.1:27182/health`。ZCode 新会话会自动连上这个 MCP 服务器；当期会话可以直接用 curl 调它的 JSON-RPC。

## 在 Creator 里跑通（首次）

1. Dashboard 添加本目录（`lgui-cocos-mcp/testbed`），用 Creator 3.8.2 打开（会生成 `temp/`、`library/`，首次编译 tsconfig）。
2. 在资源管理器里把 `assets/lgui-ui` 目录**设为 bundle**（右键 → 设为 Bundle，名字 `lgui-ui`）——cocos 后端按这个 bundle 加载界面包和翻译。
3. 新建场景：`Canvas` 下挂空节点，加 `LGUIBoot` 组件（`assets/scripts/Boot.ts`）。
4. 点预览（浏览器），控制台看到 `lgui_smoke` 的 init → create → portrait → language → done 即桥接通。

改了 ui/、框架或示例工程 → 重跑 `node sync.mjs` → 回预览刷新。

## 冒烟范围（Boot.ts）

不走 MVC——直接驱动 cocos 后端：挂载根节点 → 加载 Common 包 → 创建控件进层 → 竖版设计尺寸 → 换语言（i18n TextAsset 链路）。五层栈/换版 swap 要等测试 View 接进来（见 plan 的 T007/T008）。

## 已知校准点

骨架是「类型正确 + 语义移植」，在 Creator 里跑通时按 plan T005 证据里的 6 项 + T006 遗留 1 项逐条核对（坐标换算、事件覆盖面、双缩放、音频解锁、Event.data、包路径解析、i18n 加载——最后一项已在代码里改成 bundle TextAsset）。
