# 工程入口与空工程

从 0.2.0 起，`init` 默认创建最小空工程；背包使用显式 `--template inventory`。两者通过同一个 `.lgui/project.json` 路由执行。插件缓存只读，脚本、依赖、源工程、存档和输出都位于用户指定工作区；调用时不依赖 shell 当前目录。

```powershell
node $Lgui init --workspace $Workspace
node $Lgui doctor --workspace $Workspace
node $Lgui bootstrap --workspace $Workspace --dry-run
node $Lgui bootstrap --workspace $Workspace --install
node $Lgui build-web --workspace $Workspace
node $Lgui serve --workspace $Workspace
node $Lgui test --workspace $Workspace
node $Lgui verify-browser --workspace $Workspace -- --browser chrome
```

空工程包含 `shared/` 纯 TS、`web/` FairyGUI DOM 适配器、`project/UI.fairy` 与最小正式组件、构建和验收脚本；没有背包业务、素材、ZIP 或 Unity 场景。初始网页仅显示工程标题，验收是标题/几何 smoke，不能代表后续 UI 功能完成。作者需按目标 UI 增加交互、持久化和原生适配器。

三套依赖版本与原补丁不变。空工程将 FairyGUI Unity runtime 恢复到 `platforms/unity/FairyGUI`，由 `runtime.fairyguiDirectory` 配置；PuerTS 仍位于工作区 `unity-migration/packages`。没有安装 Unity、自动激活许可证或生成任意应用的原生业务。

## 配置格式

`.lgui/workspace.json` 保留初始化版本、模板和 `webPort` / `editorPort`。`.lgui/project.json` 是用户可编辑的工程入口，不含机器绝对路径：

```json
{
  "schemaVersion": 1,
  "name": "My UI",
  "web": {"root": "app/web", "path": "/"},
  "runtime": {"fairyguiDirectory": "platforms/unity/FairyGUI"},
  "commands": {
    "build-web": {"script": "app/scripts/build.mjs"},
    "test": {"script": "app/scripts/test.mjs"},
    "verify-browser": {"script": "app/tests/browser.mjs", "args": ["chrome"]},
    "unity-setup": {"script": "app/scripts/sync-resources.mjs"},
    "verify-unity": {"script": "app/tests/native.mjs"}
  },
  "unity": {
    "project": "app/native/UIProject",
    "logs": "app/evidence/unity",
    "target": "StandaloneWindows64",
    "methods": {"prepare": "UIBuild.Prepare", "generate": "UIBuild.Generate", "build": "UIBuild.BuildWindows"}
  }
}
```

这些路径是格式例子，必须指向工程中真实存在的文件；插件不执行占位操作。入口值可以是单个对象或顺序对象数组。每项支持 `script`、可选 `runner`（`node` 默认或 `powershell`）、`args` 字符串数组和 `cwd`（默认工作区，可选相对目录）。`--` 后的调用参数原样追加给每一步，不经 shell 拼接。所有步骤及其脚本/cwd 在任何一步运行前预检；链接、驱动路径和逃逸路径被拒绝。脚本属于受用户选择的工程代码，不是沙箱。

可配置 `build-web`、`serve`、`test`、`verify-browser`、`verify-editor`、`unity-setup`、`unity`、`verify-unity`。没有 `commands.serve` 时，插件提供 loopback 静态服务，根为 `web.root`；它阻止通过目录链接读取根外资源。`web.path` 用于显示实际预览入口。没有 `commands.unity` 时，使用下述通用原生执行器。其他缺失入口明确失败，不自动运行任何示例。

脚本进程收到 `LGUI_WORKSPACE`、`LGUI_WEB_PORT`、`EDITOR_URL`。确定性脚本应据工作区或自身位置解析资源，不能依赖插件缓存或仓库兄弟目录。`editor`、`agent` 和 `publish` 继续使用既有共享会话与通用发布器；此配置没有改变 revision、requestId、撤销和保存协议。

## Unity

准备已存在的 Unity 工程、正式包资源、共享 TS、平台适配器和 C# 构建方法，声明上面的 `unity` 段。然后运行：

```powershell
node $Lgui unity-setup --workspace $Workspace
node $Lgui unity --workspace $Workspace -- --action prepare --editor $UnityEditor
node $Lgui unity --workspace $Workspace -- --action generate --editor $UnityEditor
node $Lgui unity --workspace $Workspace -- --action build --editor $UnityEditor --cli $UnityCli
node $Lgui verify-unity --workspace $Workspace
```

可通过环境 `UNITY_EDITOR` / `UNITY_CLI` 提供本机路径。前者是已安装 Editor，后者是可选官方 Unity CLI；build 未提供 CLI 时直接运行 Editor batchmode。C# 方法决定场景、输出和 IL2CPP 设置，不传一个被忽略的输出参数。正式发布、资源复制及原生交互测试属于各项目，必须有实际 `unity-setup` / `verify-unity` 脚本。空工程未配置原生步骤时明确报告缺项，不用 smoke 冒充原生通过。

## 0.1.0 工程迁移

保留现有源码、依赖和 `.lgui/workspace.json`，直接新增 `.lgui/project.json`，按实际文件填写入口；不要对用户改过的工程重新 init 或覆写新模板。旧版本初始化的工作区也可被新 CLI 执行，doctor 会分别显示插件和工作区版本。

若继续使用原背包示例，可读取包内 [inventory recipe](../templates/inventory/project.json) 作为配置，另将 [测试启动器](../templates/inventory/test.mjs) 复制为工作区 `.lgui/inventory-test.mjs`。新 UI 不要复制它的路径、ID、画布和验收断言。初始化时换模板、版本不匹配或文件已被修改都会停止，不 reset/clean。

此次任务面板是本地外部验收工程，只公开通用能力和去敏验证摘要，不把任务面板源码、素材、Player 或缓存提交到插件仓库。
