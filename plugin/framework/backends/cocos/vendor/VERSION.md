# fairygui-cc vendor 版本

- 来源：`github.com/aloasut/fairygui-cocos`（官方 FairyGUI-cocoscreator `ccc3.0` + 去 XML 编辑器化增量），MIT
- 上游基点：`cd19b7049079550c3b184e94f0437dc9c11da623`（= 官方 ccc3.0 HEAD，2026-11-07 核查）
- 分发方式：**不再 vendored**——assets 内的 .mjs 在 CC SystemJS 下拿不到 'cc' 绑定（T007 无头构建定论），运行库由 Cocos 工程以 node_modules 依赖 `fairygui-cc` 提供（testbed 自含 `testbed/vendor/fairygui-cc/`，file: 依赖）
- 拷入日期：2026-11-07
- `fairygui-cc.d.ts`：手写 ambient 声明，只覆盖本后端用到的成员；真实签名以 fork 的 `sdk/source/src` 为准
- `cc.d.ts`：手写的引擎类型子集（ambient `declare module 'cc'`），只为本仓库的工具链类型检查用；Cocos 工程里有引擎自己的完整声明，用户工程的 tsconfig 不包含本文件
