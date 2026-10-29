# 错误码

LGUI 的每条报错都带错误码，并写明：哪个文件哪一行（如果有）、出了什么问题、下一步怎么改。

| 前缀 | 来自 | 说明 |
|---|---|---|
| `LGUI-CLI-xxx` | 命令行 | 见下表 |
| `LGUI-RT-xxx` | 运行时 | 见下表 |
| `LGUI-UI-xxx` | UI 开发规范的检查规则 | 见 [ui-spec.md](ui-spec.md) 第 13 节 |
| `LGUI-MVC-xxx` | MVC 开发规范的检查规则 | 见 [mvc-spec.md](mvc-spec.md) 第 13 节 |

## LGUI-CLI-xxx

| 错误码 | 什么时候出现 | 怎么改 |
|---|---|---|
| `LGUI-CLI-000` | 这条命令还没实现（开发中的功能） | 换一条已经实现的命令，或者等新版本 |
| `LGUI-CLI-001` | 没有这条命令 | 看报错里列出的全部命令，或者运行不带参数的 `lgui` |
| `LGUI-CLI-002` | 当前目录往上都找不到 `.lgui/project.json`，不在 LGUI 工程里 | 先运行 `lgui init`，或者 cd 到工程目录里 |
| `LGUI-CLI-003` | 工程里的框架版本（`lguiVersion`）和插件版本不一致 | 运行 `lgui upgrade` |
| `LGUI-CLI-004` | `.lgui/project.json` 读不了，或者字段缺了、类型不对、多了不认识的字段 | 按 `project-layout.md` 的字段表改 |
| `LGUI-CLI-005` | 当前平台不受支持。随插件带的 esbuild 和 sharp 只有 macOS arm64、macOS x64、Linux x64（glibc）、Windows x64 这 4 个平台的版本；Linux musl、Linux arm64、Windows arm64 都不支持 | 换到上面 4 个平台之一运行 |
| `LGUI-CLI-006` | 命令的参数不对：不认识的参数、开关带了值、要值的参数没给值 | 看报错里列出的能用的参数 |
| `LGUI-CLI-010` | `lgui init` 的目标目录已经存在而且不是空的（不会覆盖） | 换一个新目录，或者先清空 |
| `LGUI-CLI-011` | 插件里缺少要复制进工程的框架文件 | 插件不完整，重新安装 LGUI 插件 |
| `LGUI-CLI-020` | `ui/UI.fairy` 找不到，或者 OpenFairyGUI 校验界面工程没通过（报错里逐条列出 OpenFairyGUI 给的问题） | 按提示改 `ui/` 里对应的文件 |
| `LGUI-CLI-021` | 生成界面包时缺文件：OpenFairyGUI 没生成某个包，或者 `package.xml` 里登记的图片文件不存在 | 把图片放回 `package.xml` 写的位置，或者删掉这条资源 |
| `LGUI-CLI-999` | 命令行内部错误（LGUI 自己的缺陷） | 把输出报告给维护者 |

## LGUI-RT-xxx

| 错误码 | 什么时候出现 | 怎么改 |
|---|---|---|
| `LGUI-RT-001` | 当前后端或框架还没实现这项功能（开发中） | 换到已经实现的后端，或者先不用这项功能 |
| `LGUI-RT-010` | 网页端的散图映射 `manifest.json` 格式不对，或者里面没有某个包、某张图片 | 重新运行 `lgui dev` 生成界面包 |
| `LGUI-RT-011` | 网页端加载界面包失败（地址不对或文件不存在） | 确认包名对，并重新运行 `lgui dev` |
