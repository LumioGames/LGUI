# 构建与发布

1. 从远程当前 main 建功能分支，检查并保留未提交改动。更新根 plugin.json 的 semver；根 npm 包版本、兼容 manifest 和模板摘要由 generate 同步。
2. 恢复根验证依赖 `npm ci --ignore-scripts`。执行：

```sh
node tools/generate.mjs
node tools/generate.mjs --check
node tools/validate.mjs
node --test tests/*.test.mjs scripts/bootstrap.test.mjs prototype/model.test.ts unity-migration/complex-inventory/shared/complex-inventory.test.mjs unity-migration/complex-inventory/fidelity/*.test.mjs unity-migration/complex-inventory/scripts/layout.test.mjs
node tools/pack.mjs
node tools/validate.mjs artifacts/lgui-0.1.0
node tools/package-smoke.mjs artifacts/lgui-0.1.0.tar.gz
```

pack 输出新的目录、tar.gz 与 SHA256，不覆盖现有目录。按版本替换最后的路径。包内 package-integrity.json 列出所有文件和摘要，允许清单排除历史日志、依赖、凭据、缓存和本机安装程序。解压后从另一个 cwd 和全新工作区运行 init/bootstrap/build/serve，验证包没有借用仓库或上级文件。

3. 双端用真实 marketplace install，记录版本、缓存目录（公开记录归一化）、skill discovery、代表性执行、缺少输入与负例。桌面 onboarding、客户端登录缺失、Unity/license 缺失必须单独写未测；不以 schema 替代。
4. 运行浏览器编辑保存/重开及 UI 功能/视觉检查。Unity 需要本机许可证与 IL2CPP；本次历史状态不自动变化。更新 docs/evidence.md，保留历史失败。
5. 提交、推送、开 PR，检查 CI 后按仓库规则合并。官方目录上架需要单独决定，不在本次流程自动申请。GitHub Release 可上传通过验证的 tar.gz/SHA256，但不要把 Player、编辑器构建、第三方原生依赖或安装器混入插件包。

CI 只覆盖可自动完成的 schema/元数据、包闭包、链接与核心测试。它不包含登录后的宿主调用、Windows 视觉/IME、Unity runtime 或许可审核。
