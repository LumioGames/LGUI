// 由 plugin/plugin.json 生成两个宿主清单和两份 marketplace 清单。
// 用法：node scripts/generate.mjs [--check]。带 --check 时只比较、不写，不一致就报错退出。
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

export function generatedFiles() {
  const manifest = readJson('plugin/plugin.json');
  const {$schema, extensions, ...portable} = manifest;
  const openai = extensions?.['com.openai'] ?? {};
  return {
    'plugin/.claude-plugin/plugin.json': portable,
    'plugin/.codex-plugin/plugin.json': {...portable, skills: './skills/', ...openai},
    '.claude-plugin/marketplace.json': {
      $schema: 'https://json.schemastore.org/claude-code-marketplace.json',
      name: 'lumio-lgui',
      owner: manifest.author,
      plugins: [{
        name: manifest.name,
        source: {source: 'git-subdir', url: 'https://github.com/LumioGames/LGUI.git', path: 'plugin'},
        version: manifest.version,
        description: manifest.description,
        homepage: manifest.homepage,
        repository: manifest.repository,
        license: manifest.license,
        category: 'development',
        keywords: manifest.keywords
      }]
    },
    '.agents/plugins/marketplace.json': {
      name: 'lumio-lgui',
      interface: {displayName: 'LumioGames LGUI'},
      plugins: [{
        name: manifest.name,
        source: {source: 'local', path: './plugin'},
        policy: {installation: 'AVAILABLE', authentication: 'ON_INSTALL'},
        category: 'Developer Tools'
      }]
    }
  };
}

// 返回不一致的文件列表（只比较，不写）。
export function staleFiles() {
  return Object.entries(generatedFiles())
    .filter(([file, data]) => {
      const destination = path.join(root, file);
      return !fs.existsSync(destination) || fs.readFileSync(destination, 'utf8') !== JSON.stringify(data, null, 2) + '\n';
    })
    .map(([file]) => file);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) {
    const stale = staleFiles();
    if (stale.length) {
      for (const file of stale) console.error(`${file}  和 plugin/plugin.json 不一致  → 运行 node scripts/generate.mjs`);
      process.exit(1);
    }
    console.log('生成文件和 plugin/plugin.json 一致。');
  } else {
    for (const [file, data] of Object.entries(generatedFiles())) {
      const destination = path.join(root, file);
      fs.mkdirSync(path.dirname(destination), {recursive: true});
      fs.writeFileSync(destination, JSON.stringify(data, null, 2) + '\n');
    }
    console.log('已从 plugin/plugin.json 生成两个宿主清单和两份 marketplace 清单。');
  }
}
