# 参与开发

## 仓库怎么分

- `plugin/`：发布面。插件市场只下发这个文件夹，用户机器上看到的就是它的全部内容。这里不能放测试、CI、`package.json`、`node_modules/` 之类的开发文件（随插件带的工具 `plugin/tools/vendor/`、Unity 包模板和新建工程模板除外），`npm run check` 会检查。
- `examples/`：示例工程，不下发。
- `tests/`：开发用测试。
- `scripts/`：开发用脚本（生成清单、发版前校验、编译编辑器等）。

## 日常流程

1. 用 Node 24.22.1。
2. 每个任务从最新的 `origin/main` 建自己的 worktree 和分支：`git worktree add ../LGUI-wt/<任务号> -b lgui/<任务号>-<短名> origin/main`。不在主目录里直接改，因为可能有别的 Agent 同时在这个仓库干活。
3. 改了插件版本或身份，只改 `plugin/plugin.json`，再运行 `npm run generate`。改了根目录的 `CHANGELOG.md` 也要运行它（会复制成 `plugin/CHANGELOG.md`，`lgui upgrade` 要读）。
4. 提交前跑 `npm run check` 和 `npm test`。
5. 一个任务一个 PR。PR 里写：任务号、做了什么、跑了哪些命令和关键输出；没跑的写「未执行」。CI 是红是绿都不拦合入；CI 跑不起来时在 PR 里写明。
6. 合入 main、打 tag、推 tag、删除远端分支、任何对外发布，都要先问 Owner。

## 写代码的约定

- 命令行工具写 `.mjs`（ESM）；框架和用户代码写 TypeScript，不用 `any`。
- 报错一律带错误码（`LGUI-CLI-xxx`、`LGUI-RT-xxx`、`LGUI-UI-xxx`、`LGUI-MVC-xxx`），写明文件和行号（如果有）、出了什么问题、下一步怎么改。不悄悄兜底。新的错误码同步写进 `plugin/references/error-codes.md`。
- 每加一个第三方组件，同一个 PR 里更新 `plugin/THIRD_PARTY_NOTICES.md`。
- 改了用户能感知的行为，同一个 PR 里更新 `plugin/references/` 和技能。文档只写现状。
- 不提交令牌、浏览器配置、凭据、个人绝对路径。

## 怎么更新随插件带的工具

随插件带的工具放在 `plugin/tools/vendor/`（TypeScript、esbuild、OpenFairyGUI、sharp、playwright-core），连同 `node_modules/` 一起提交进 git，用户不用装任何东西。

1. 改 `scripts/vendor-tools.mjs` 开头的版本表。
2. 运行 `node scripts/vendor-tools.mjs`（需要能访问 npm 仓库）。它会在临时目录里按 macOS arm64、macOS x64、Linux x64（glibc）、Windows x64 各装一次（`--ignore-scripts`，不跑安装脚本），合并成一份 `node_modules/`，原生包每个平台留一份；再写 `package.json`、`package-lock.json` 和 `VERSIONS.md`（每个包的版本、许可、大小）。有单个文件超过 100 MB（GitHub 的上限）就停下报错。
3. 运行 `node scripts/tools-smoke.mjs`，5 个工具都要通过（没有 Chrome 也没有 Edge 时浏览器那一项会标「跳过」）。
4. 新增或换掉的第三方包，同一个 PR 里更新 `plugin/THIRD_PARTY_NOTICES.md`。

框架和命令行通过 `plugin/tools/lib/vendor.mjs` 加载这些工具；不在 4 个平台之内时报 `LGUI-CLI-005`。

## 怎么重新编译编辑器

（S2-I1 完成后补上。编辑器补丁现在在 `scripts/build-editor/patches/`。）

## 许可

原创贡献按 MIT 提供。第三方素材要写明许可和来源。
