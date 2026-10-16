# 构建与发布

1. 从远程当前 main 建功能分支，检查并保留未提交改动。更新根 plugin.json 的 semver；根 npm 包版本、兼容 manifest 和模板摘要由 generate 同步。
2. 恢复根验证依赖 `npm ci --ignore-scripts`。执行：

```sh
node tools/generate.mjs
node tools/generate.mjs --check
node tools/validate.mjs
node --test tests/*.test.mjs scripts/bootstrap.test.mjs prototype/model.test.ts unity-migration/complex-inventory/shared/complex-inventory.test.mjs unity-migration/complex-inventory/fidelity/*.test.mjs unity-migration/complex-inventory/scripts/layout.test.mjs
node tools/pack.mjs artifacts/plugin
node tools/validate.mjs artifacts/plugin
node tools/package-smoke.mjs artifacts/plugin.tar.gz
```

pack 输出新的目录、tar.gz 与 SHA256，不覆盖现有目录；重复验证需选择新的输出名。发布时可选择 `artifacts/lgui-<version>`。版本始终读取根 plugin.json。包内 package-integrity.json 列出所有文件和摘要，包含两种模板引用的全部资源；允许清单排除日志、依赖、凭据、缓存和安装程序。解压后在另一个 cwd 验证默认空工程与显式 inventory，再恢复新空工程依赖并运行 build/serve。自定义 UI 通过工程清单复跑网页与 Unity。

3. 双端用真实 marketplace install，记录版本、缓存目录（公开记录归一化）、skill discovery、代表性执行、缺少输入与负例。桌面 onboarding、客户端登录缺失、Unity/license 缺失必须单独写未测；不以 schema 替代。
4. 运行浏览器编辑保存/重开及 UI 功能/视觉检查。Unity 需要本机许可证与 IL2CPP；本次历史状态不自动变化。更新 docs/evidence.md，保留历史失败。
5. 提交、推送、开 PR，检查 CI 后按仓库规则合并。官方目录上架需要单独决定，不在本次流程自动申请。GitHub Release 可上传通过验证的 tar.gz/SHA256，但不要把 Player、编辑器构建、第三方原生依赖或安装器混入插件包。

CI 只覆盖可自动完成的 schema/元数据、包闭包、链接与核心测试。它不包含登录后的宿主调用、Windows 视觉/IME、Unity runtime 或许可审核。
