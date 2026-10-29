# 错误码

LGUI 的每条报错都带错误码，并写明：哪个文件哪一行（如果有）、出了什么问题、下一步怎么改。

| 前缀 | 来自 | 说明 |
|---|---|---|
| `LGUI-CLI-xxx` | 命令行 | 见下表 |
| `LGUI-RT-xxx` | 运行时 | 见下表 |
| `LGUI-UI-xxx` | UI 开发规范的检查规则 | 见 `ui-spec.md` 的检查规则表 |
| `LGUI-MVC-xxx` | MVC 开发规范的检查规则 | 见 `mvc-spec.md` 的检查规则表 |

## LGUI-CLI-xxx

| 错误码 | 什么时候出现 | 怎么改 |
|---|---|---|
| `LGUI-CLI-005` | 当前平台不受支持。随插件带的 esbuild 和 sharp 只有 macOS arm64、macOS x64、Linux x64（glibc）、Windows x64 这 4 个平台的版本；Linux musl、Linux arm64、Windows arm64 都不支持 | 换到上面 4 个平台之一运行 |

## LGUI-RT-xxx

| 错误码 | 什么时候出现 | 怎么改 |
|---|---|---|
