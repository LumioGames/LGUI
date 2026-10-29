# 维护 LGUI 仓库

给维护本仓库的 Agent 看。用户工程的用法见 README。

- **目录约定：** `plugin/` 是发布面，装到用户机器上的就是这个文件夹的全部内容；`examples/`、`tests/`、`scripts/` 和根目录的其他文件只给开发用。`plugin/plugin.json` 是插件版本和身份的唯一来源，两个宿主清单和两份 marketplace 清单由 `npm run generate` 生成，不手改。
- **怎么跑：** Node 24.22.1。`npm run check`（发版前校验：发布面里没混入开发文件、链接都能打开、生成文件一致，并打印 `plugin/` 大小）；`npm test`（`tests/` 下的全部测试，用 Node 自带的 `node:test`）。
- **规范在哪：** `plugin/references/`（用户工程目录、接入 Unity、错误码；UI 开发规范和 MVC 开发规范就位后也放这里）。
- **执行计划在哪：** 不在本仓库，在 Owner 的 LumioNext 工作目录里（`LGUI-EXECUTION-PLAN-20261029.md`）。每个任务一个 git worktree、一个分支、一个 PR；不直接改 main。
- **贡献流程：** 见 [CONTRIBUTING.md](CONTRIBUTING.md)。
