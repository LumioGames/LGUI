# fairygui-cc vendor 版本

- 来源：`github.com/aloasut/fairygui-cocos`（官方 FairyGUI-cocoscreator `ccc3.0` + 去 XML 编辑器化增量），MIT
- 上游基点：`cd19b7049079550c3b184e94f0437dc9c11da623`（= 官方 ccc3.0 HEAD，2026-11-07 核查）
- 构建产物：`sdk/source/dist/fairygui.mjs`（fairygui-cc 1.2.2，ESM，运行时 `import ... from 'cc'`——只在 Cocos Creator 工程里能跑）
- 拷入日期：2026-11-07
- `fairygui.d.mts`（配套 `fairygui.mjs`）：手写，只声明本后端用到的成员（同 h5 vendor 的做法）；真实签名以 fork 的 `sdk/source/src` 为准
- `cc.d.ts`：手写的引擎类型子集（ambient `declare module 'cc'`），只为本仓库的工具链类型检查用；Cocos 工程里有引擎自己的完整声明，用户工程的 tsconfig 不包含本文件
