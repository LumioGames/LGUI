// One source tree; the package copies this allowlist, never a sibling checkout.
import {filesUnder} from './paths.mjs';
export function templateFiles(root) {
  const roots = ['package.json','package-lock.json','dependencies.lock.json','LICENSE','THIRD_PARTY_NOTICES.md','patches',
    'scripts/bootstrap.mjs','scripts/bootstrap.test.mjs','scripts/build.mjs','scripts/serve.mjs','scripts/browser-acceptance.mjs','tools/agent.mjs','prototype',
    'toolchain-test/package.json','toolchain-test/package-lock.json','toolchain-test/Inventory.zip','toolchain-test/project',
    'unity-migration/complex-inventory','unity-migration/InventoryUnity','unity-migration/ts','unity-migration/scripts',
    '闭环验证/browser-acceptance.mjs','闭环验证/agent-cli.mjs','闭环验证/text-fix/inspector-text-regression.test.mjs'];
  return [...new Set(roots.flatMap(item => filesUnder(root,item)))].filter(file =>
    !/(^|\/)(evidence|node_modules|Library|Temp|Logs|UserSettings|obj|\.git)(\/|$)/i.test(file) &&
    !/\.(log|tap|map|csproj|sln|slnx)$/.test(file) &&
    !/(^|\/)(tests-(red|green|final|dto-red)|build|publish-report|verification-report)\.json$/.test(file) &&
    !file.endsWith('.md') && !file.endsWith('.html') || ['LICENSE','THIRD_PARTY_NOTICES.md'].includes(file)
  ).concat(roots.flatMap(item => filesUnder(root,item)).filter(file => /\/(index|compare)\.html$/.test(file) && !file.includes('/evidence/')))
    .filter((file,index,all)=>all.indexOf(file)===index).sort();
}
export function pluginFiles(root) {
  return ['plugin.json','template-files.json','README.md','README.en.md','PUBLICATION.md','CONTRIBUTING.md','AGENTS.md','CLAUDE.md',
    '.claude-plugin/plugin.json','.codex-plugin/plugin.json','.agents/plugins/marketplace.json','.claude-plugin/marketplace.json',
    ...filesUnder(root,'skills'),...filesUnder(root,'tools'),...filesUnder(root,'docs')];
}
