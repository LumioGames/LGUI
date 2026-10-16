import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = path.join(root, 'evidence');
const versions = [];
for (const name of fs.readdirSync(path.join(root, 'repos'))) {
  const repo = path.join(root, 'repos', name);
  if (!fs.existsSync(path.join(repo, '.git'))) continue;
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
  versions.push({ name, source: git('remote', 'get-url', 'origin'), branch: git('branch', '--show-current'), sha: git('rev-parse', 'HEAD'), commitDate: git('log', '-1', '--format=%cI'), trackedChanges: git('diff', '--name-only'), status: git('status', '--porcelain'), licenseFiles: fs.readdirSync(repo).filter(x => /license|notice|trademark/i.test(x)) });
}
fs.writeFileSync(path.join(evidence, 'repository-versions.json'), JSON.stringify({ checkDate: '2026-10-15 America/Los_Angeles', repositories: versions }, null, 2));
const entries = [];
const exclude = new Set(['evidence/file-inventory.jsonl', 'evidence/delivery-hashes.json']);
function walk(dir) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, d.name), relative = path.relative(root, file).replaceAll('\\', '/');
    if (exclude.has(relative)) continue;
    if (d.isSymbolicLink()) { entries.push({ path: relative, type: 'link', target: fs.readlinkSync(file) }); continue; }
    if (d.isDirectory()) walk(file);
    else { const stat = fs.statSync(file); entries.push({ path: relative, type: 'file', bytes: stat.size }); }
  }
}
walk(root); entries.sort((a, b) => a.path.localeCompare(b.path));
fs.writeFileSync(path.join(evidence, 'file-inventory.jsonl'), entries.map(x => JSON.stringify(x)).join('\n') + '\n');
const delivery = entries.filter(x => x.type === 'file' && !x.path.startsWith('repos/') && !x.path.includes('node_modules/') && !x.path.startsWith('evidence/') && !x.path.startsWith('research/unity/') && !x.path.startsWith('research/onejs/'));
delivery.push(...entries.filter(x => /research\/(unity|onejs)\/[^/]+\.md$/.test(x.path)));
const hashes = delivery.map(x => ({ ...x, sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(root, x.path))).digest('hex') }));
fs.writeFileSync(path.join(evidence, 'delivery-hashes.json'), JSON.stringify(hashes, null, 2));
console.log(JSON.stringify({ filesAndLinks: entries.length, bytes: entries.reduce((s, x) => s + (x.bytes || 0), 0), deliveryHashed: hashes.length, researchRepos: versions.length }));
