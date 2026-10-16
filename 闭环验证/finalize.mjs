import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../repos/editor-online');
const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' });
const untracked = git('ls-files', '--others', '--exclude-standard').trim().split('\n').filter(Boolean);
let patch = git('diff', '--binary', 'HEAD');
for (const file of untracked) {
  const lines = fs.readFileSync(path.join(repo, file), 'utf8').replaceAll('\r\n', '\n').split('\n');
  if (lines.at(-1) === '') lines.pop();
  patch += `diff --git a/${file} b/${file}\nnew file mode 100644\n--- /dev/null\n+++ b/${file}\n@@ -0,0 +1,${lines.length} @@\n${lines.map(line => '+' + line).join('\n')}\n`;
}
fs.writeFileSync(path.join(here, 'implementation.patch'), patch);
const modified = [...new Set([...git('diff', '--name-only', 'HEAD').trim().split('\n').filter(Boolean), ...untracked])];
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const files = modified.map(file => ({ path: file, sha256: hash(path.join(repo, file)), bytes: fs.statSync(path.join(repo, file)).size }));
const reports = [
  ['chrome', '2026-10-16T07-57-12-927Z-chrome'],
  ['edge', '2026-10-16T07-59-58-225Z-edge'],
  ['persistentChrome', '2026-10-16T07-59-58-237Z-chrome-persistent'],
].map(([name, dir]) => {
  const report = JSON.parse(fs.readFileSync(path.join(here, 'evidence', dir, 'report.json')));
  return { name, report: `evidence/${dir}/report.json`, status: report.status, checks: report.checks.length, passed: report.checks.every(c => c.pass), errors: report.errors.length };
});
const dom = JSON.parse(fs.readFileSync(path.join(here, 'evidence/dom-roundtrip.json'))).map(r => ({ name: r.browser, checks: r.checks.length, passed: r.passed, errors: r.errors.length }));
const result = { date: '2026-10-16 America/Los_Angeles', baseCommit: git('rev-parse', 'HEAD').trim(), files, reports, dom, patchSha256: hash(path.join(here, 'implementation.patch')), processes: JSON.parse(fs.readFileSync(path.join(here, 'processes.json'), 'utf8').replace(/^\uFEFF/, '')), note: 'Local token file and browser profile are not shareable source artifacts.' };
fs.writeFileSync(path.join(here, 'changes.json'), JSON.stringify(result, null, 2));
const inventory = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name), relative = path.relative(here, file).replaceAll('\\', '/');
    if (relative === 'inventory.jsonl' || relative === 'agent-connection.local.json') continue;
    if (item.isSymbolicLink()) { inventory.push({ path: relative, type: 'link' }); continue; }
    if (item.isDirectory()) walk(file); else inventory.push({ path: relative, bytes: fs.statSync(file).size });
  }
}
walk(here);
fs.writeFileSync(path.join(here, 'inventory.jsonl'), inventory.map(r => JSON.stringify(r)).join('\n') + '\n');
console.log(JSON.stringify({ filesChanged: files.length, reports, dom, inventoryEntries: inventory.length }));
