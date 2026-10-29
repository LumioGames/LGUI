# 参与开发

## 仓库怎么分

- `plugin/`：发布面。插件市场只下发这个文件夹，用户机器上看到的就是它的全部内容。这里不能放测试、CI、`package.json`、`node_modules/` 之类的开发文件（随插件带的工具 `plugin/tools/vendor/`、Unity 包模板和新建工程模板除外），`npm run check` 会检查。
- `examples/`：示例工程，不下发。
- `tests/`：开发用测试。
- `scripts/`：开发用脚本（生成清单、发版前校验、编译编辑器等）。

## 日常流程

1. 用 Node 24.22.1。
2. 每个任务从最新的 `origin/main` 建自己的 worktree 和分支：`git worktree add ../LGUI-wt/<任务号> -b lgui/<任务号>-<短名> origin/main`。不在主目录里直接改，因为可能有别的 Agent 同时在这个仓库干活。
3. 改了插件版本或身份，只改 `plugin/plugin.json`，再运行 `npm run generate`。
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

（S2-A1 完成后补上。）

## 怎么重新编译编辑器

（S2-I1 完成后补上。编辑器补丁现在在 `scripts/build-editor/patches/`。）

## 许可

原创贡献按 MIT 提供。第三方素材要写明许可和来源。
