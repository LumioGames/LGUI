# testbed/（占位）

Cocos Creator 3.8.2 测试工程，M1 的验收场：

1. LGUI 后端 `plugin/framework/backends/cocos/` 在真实 CC 工程里启动（GRoot 挂载、五层栈、激活/遮挡）
2. 横竖屏换版（@portrait swap 保留 View 实例）、换语言重建
3. conformance 第四方：与 headless/h5/unity 比对快照

**工程来源未定（Q1）**：新建最小工程，或移植 fork 的 sdk/demo（16 包/159 组件回归场）再裁剪。定了之后把工程放进本目录并在此登记结构；`.gitignore` 已备好 CC 产物排除（`library/`、`temp/`、`logs/`、`userSettings/` 等）。
