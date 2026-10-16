import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));

// Text records use Git's LF form. Release archives and native binaries always use raw bytes.
export function canonicalTextSha256(bytes) { return sha256(Buffer.from(bytes.toString('utf8').replaceAll('\r\n', '\n'))); }

export function parseOptions(args) {
  for (const arg of args) if (!['--install', '--dry-run', '--unity', '--help'].includes(arg)) throw Error(`Unknown option: ${arg}`);
  if (args.includes('--install') && args.includes('--dry-run')) throw Error('--install and --dry-run are mutually exclusive.');
  return { install: args.includes('--install'), unity: args.includes('--unity') };
}

export function safeArchivePath(name, archiveRoot) {
  const parts = name.replace(/\/$/, '').split('/');
  if (!name || name.startsWith('/') || name.includes('\\') || name.includes(':') || name.includes('\0')
      || parts[0] !== archiveRoot || parts.some(p => !p || p === '.' || p === '..')) throw Error(`Unsafe archive path: ${name}`);
  return parts.slice(1).join('/');
}

export function decideFileAction(existing, expected) {
  if (existing === null) return 'write';
  if (existing.equals(expected)) return 'skip';
  throw Error('Refusing to overwrite an existing differing file. Move it aside or reconcile it manually.');
}

export function patchUnbox(bytes, contract) {
  const digest = sha256(bytes);
  if (digest === contract.patchedSha256) return bytes;
  if (digest !== contract.originalSha256) throw Error('Unknown PuerTS source; refusing the compatibility patch.');
  const text = bytes.toString('utf8');
  const matches = text.match(/(?:il2cpp::vm::)?Object::Unbox\(/g) || [];
  if (matches.length !== contract.replacements) throw Error(`Expected ${contract.replacements} Unbox calls, found ${matches.length}.`);
  const patched = Buffer.from(text.replaceAll('il2cpp::vm::Object::Unbox(', 'il2cpp_object_unbox(').replaceAll('Object::Unbox(', 'il2cpp_object_unbox('));
  if (sha256(patched) !== contract.patchedSha256) throw Error('PuerTS patched digest mismatch.');
  return patched;
}

function inside(relative) {
  const absolute = path.resolve(root, relative);
  if (absolute !== root && !absolute.startsWith(root + path.sep)) throw Error(`Path leaves LGUI: ${relative}`);
  let parent = absolute;
  while (parent !== root) {
    if (fs.existsSync(parent) && fs.lstatSync(parent).isSymbolicLink()) throw Error(`Symbolic link is not allowed: ${parent}`);
    parent = path.dirname(parent);
  }
  return absolute;
}

function checkHash(file, expected) {
  if (!fs.existsSync(file) || canonicalTextSha256(fs.readFileSync(file)) !== expected) throw Error(`Pinned digest mismatch: ${path.relative(root, file)}`);
}

function run(command, args, cwd = root, { acceptOne = false } = {}) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0 && !(acceptOne && result.status === 1)) throw Error(`${command} ${args.join(' ')} failed (${result.status}).\n${result.stderr || result.stdout}`);
  return result.stdout.trim();
}

function git(args, cwd = root) { return run('git', args, cwd); }

function listFiles(directory, prefix = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    if (entry.isSymbolicLink()) throw Error(`Symbolic link is not allowed: ${path.join(directory, entry.name)}`);
    const relative = prefix + entry.name;
    if (entry.isDirectory()) return listFiles(path.join(directory, entry.name), relative + '/');
    if (!entry.isFile()) throw Error(`Unsupported filesystem entry: ${relative}`);
    return [relative];
  });
}

function safeCopy(source, relativeTarget) {
  const target = inside(relativeTarget);
  const bytes = fs.readFileSync(source);
  const action = decideFileAction(fs.existsSync(target) ? fs.readFileSync(target) : null, bytes);
  if (action === 'write') {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes, { flag: 'wx' });
  }
}

function checkEditorPatch(directory, spec) {
  const expected = new Set(spec.patchedFiles.map(f => f.path));
  const changed = git(['diff', '--name-only', '-z'], directory).split('\0').filter(Boolean);
  const untracked = git(['ls-files', '--others', '--exclude-standard', '-z'], directory).split('\0').filter(Boolean);
  if (git(['diff', '--cached', '--name-only'], directory)) throw Error('Editor has staged changes; refusing to alter its worktree.');
  for (const name of [...changed, ...untracked]) if (!expected.has(name)) throw Error(`Editor has unrelated local changes: ${name}`);
  for (const file of spec.patchedFiles) {
    if (!fs.existsSync(path.join(directory, file.path)) || git(['hash-object', '--path=' + file.path, file.path], directory) !== file.gitBlobSha1) {
      throw Error(`Editor patch differs from the delivered version: ${file.path}`);
    }
  }
}

function ensureRepository(spec) {
  const directory = inside(spec.directory);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(path.dirname(directory), { recursive: true });
    fs.mkdirSync(directory);
    git(['init', '--quiet', directory]);
    git(['config', 'core.autocrlf', 'false'], directory);
    git(['remote', 'add', 'origin', spec.url], directory);
    git(['fetch', '--depth=1', 'origin', spec.commit], directory);
    git(['checkout', '--quiet', '--detach', spec.commit], directory);
  } else {
    if (!fs.existsSync(path.join(directory, '.git'))) throw Error(`Existing directory is not a Git clone: ${spec.directory}`);
    const remote = git(['remote', 'get-url', 'origin'], directory);
    if (remote !== spec.url) throw Error(`Unexpected origin for ${spec.key}; it will not be changed.`);
    if (git(['rev-parse', 'HEAD'], directory) !== spec.commit) throw Error(`Existing ${spec.key} HEAD is not pinned; no checkout/reset will be attempted.`);
  }
  if (spec.patch) {
    checkHash(inside(spec.patch), spec.patchSha256);
    const dirty = git(['status', '--porcelain', '--untracked-files=normal'], directory);
    if (!dirty) {
      git(['apply', '--check', inside(spec.patch)], directory);
      git(['apply', inside(spec.patch)], directory);
    }
    checkEditorPatch(directory, spec);
  } else if (git(['status', '--porcelain', '--untracked-files=normal'], directory)) {
    throw Error(`Existing ${spec.key} has local changes; no reset will be attempted.`);
  }
  checkHash(path.join(directory, spec.license.path), spec.license.sha256);
  console.log(`Ready: ${spec.directory} @ ${spec.commit}`);
}

function validateNpmSpec(spec) {
  const directory = inside(spec.directory);
  checkHash(path.join(directory, 'package.json'), spec.packageJsonSha256);
  checkHash(path.join(directory, 'package-lock.json'), spec.packageLockSha256);
  const lock = json(path.join(directory, 'package-lock.json'));
  for (const [name, version] of Object.entries(spec.required)) {
    if (lock.packages?.['node_modules/' + name]?.version !== version) throw Error(`Expected locked ${name}@${version} in ${spec.directory}`);
  }
  return directory;
}

function npmCli() {
  // Run npm's JS entry with Node: no command string or shell interpolation on Windows.
  const candidates = [process.env.npm_execpath, path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js')].filter(Boolean);
  const locator = process.platform === 'win32' ? 'where.exe' : 'which';
  const found = spawnSync(locator, [process.platform === 'win32' ? 'npm.cmd' : 'npm'], { encoding: 'utf8', windowsHide: true });
  if (found.status === 0) for (const file of found.stdout.trim().split(/\r?\n/)) {
    candidates.push(path.join(path.dirname(file), 'node_modules/npm/bin/npm-cli.js'));
    if (fs.existsSync(file) && process.platform !== 'win32') candidates.push(fs.realpathSync(file));
  }
  const cli = candidates.find(file => fs.existsSync(file) && /npm-cli\.js$/.test(file));
  if (!cli) throw Error('Cannot locate npm-cli.js. Use an official Node.js installation with npm.');
  return cli;
}

function installedVersionsMatch(directory, required) {
  return Object.entries(required).every(([name, version]) => {
    const manifest = path.join(directory, 'node_modules', name, 'package.json');
    return fs.existsSync(manifest) && json(manifest).version === version;
  });
}

function installNpm(spec, cli) {
  const directory = validateNpmSpec(spec);
  const modules = path.join(directory, 'node_modules');
  if (fs.existsSync(modules)) {
    if (!installedVersionsMatch(directory, spec.required)) throw Error(`Existing ${spec.directory}/node_modules differs. Move it aside manually; bootstrap does not delete it.`);
    console.log(`Skip existing matching dependencies: ${spec.directory}`);
  } else {
    console.log(`npm ci --ignore-scripts --include=optional: ${spec.directory}`);
    run(process.execPath, [cli, 'ci', '--ignore-scripts', '--include=optional', '--no-audit', '--no-fund'], directory);
    if (!installedVersionsMatch(directory, spec.required)) throw Error(`Installed versions do not match: ${spec.directory}`);
  }
  if (spec.required.sharp) {
    const require = createRequire(path.join(directory, 'package.json'));
    const sharp = require('sharp');
    if (sharp.versions.sharp !== spec.required.sharp) throw Error('sharp native loader version mismatch.');
  }
}

function copyUnityRuntime(lock) {
  const spec = lock.unityCopy;
  const repo = lock.repositories.find(item => item.key === spec.repository);
  const source = inside(repo.directory + '/' + spec.source);
  if (!fs.existsSync(path.join(source, 'UI/UIPackage.cs')) || !fs.existsSync(path.join(source, 'Core/Stage.cs'))) {
    throw Error(`FairyGUI Unity runtime source layout changed: ${source}`);
  }
  const files = listFiles(source);
  // Validate the whole copy set first, before creating any destination files.
  for (const file of files) {
    const destination = inside(spec.destination + '/' + file);
    decideFileAction(fs.existsSync(destination) ? fs.readFileSync(destination) : null, fs.readFileSync(path.join(source, file)));
  }
  for (const file of files) safeCopy(path.join(source, file), spec.destination + '/' + file);
  safeCopy(inside(repo.directory + '/' + spec.licenseSource), spec.licenseDestination);
  console.log(`Ready: FairyGUI Unity Scripts (${files.length} files), original LICENSE retained.`);
}

export function readReleaseTar(gzip, spec) {
  if (sha256(gzip) !== spec.sha256 || gzip.length !== spec.bytes) throw Error(`PuerTS archive digest/size mismatch: ${spec.asset}`);
  const tar = gunzipSync(gzip, { maxOutputLength: 512 * 1024 * 1024 });
  const entries = [];
  const names = new Set();
  for (let offset = 0; offset + 512 <= tar.length && tar[offset];) {
    const header = tar.subarray(offset, offset + 512);
    const string = (start, end) => header.subarray(start, end).toString('utf8').split('\0')[0];
    const name = string(345, 500) ? string(345, 500) + '/' + string(0, 100) : string(0, 100);
    const relative = safeArchivePath(name, spec.archiveRoot);
    const type = header[156];
    if (![0, 48, 53].includes(type)) throw Error(`Unsupported archive entry type ${type}: ${name}; links are never extracted.`);
    const sizeText = string(124, 136).trim();
    if (!/^[0-7]+$/.test(sizeText)) throw Error(`Invalid tar size: ${name}`);
    const size = parseInt(sizeText, 8);
    if (offset + 512 + size > tar.length) throw Error(`Truncated tar entry: ${name}`);
    if (type !== 53) {
      if (!relative || names.has(relative.toLowerCase())) throw Error(`Duplicate/empty archive filename: ${name}`);
      names.add(relative.toLowerCase());
      const bytes = tar.subarray(offset + 512, offset + 512 + size);
      const expected = spec.files.find(file => file.path === relative);
      if (!expected || expected.bytes !== size || expected.sha256 !== sha256(bytes)) throw Error(`Unexpected release file: ${name}`);
      entries.push({ path: relative, bytes });
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  if (entries.length !== spec.files.length) throw Error(`Incomplete release archive: ${spec.asset}`);
  return entries;
}

async function ensurePuerTS(spec, contract) {
  const destination = inside(spec.directory);
  if (fs.existsSync(destination)) {
    for (const file of spec.files) {
      const filePath = inside(spec.directory + '/' + file.path);
      const digest = fs.existsSync(filePath) ? sha256(fs.readFileSync(filePath)) : '';
      const allowedPatched = spec.name.endsWith('.core') && file.path === contract.path && digest === contract.patchedSha256;
      if (digest !== file.sha256 && !allowedPatched) throw Error(`Existing PuerTS file differs: ${spec.directory}/${file.path}`);
    }
  } else {
    const cached = inside('repos/.bootstrap-cache/' + spec.asset);
    let archive;
    if (fs.existsSync(cached)) archive = fs.readFileSync(cached);
    else {
      console.log(`Download pinned archive: ${spec.url}`);
      const response = await fetch(spec.url);
      if (!response.ok) throw Error(`Download failed (${response.status}): ${spec.asset}`);
      archive = Buffer.from(await response.arrayBuffer());
    }
    const entries = readReleaseTar(archive, spec); // All names and hashes checked before writing.
    if (!fs.existsSync(cached)) {
      fs.mkdirSync(path.dirname(cached), { recursive: true });
      fs.writeFileSync(cached, archive, { flag: 'wx' });
    }
    fs.mkdirSync(inside('repos'), { recursive: true });
    const stage = fs.mkdtempSync(inside('repos/.bootstrap-stage-'));
    for (const entry of entries) {
      const target = path.join(stage, entry.path);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, entry.bytes, { flag: 'wx' });
    }
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.renameSync(stage, destination);
  }
  if (spec.name.endsWith('.core')) {
    const file = inside(spec.directory + '/' + contract.path);
    const original = fs.readFileSync(file);
    const patched = patchUnbox(original, contract);
    if (!original.equals(patched)) fs.writeFileSync(file, patched);
  }
  safeCopy(inside(spec.directory + '/LICENSE'), 'unity-migration/packages/notices/' + spec.name + '-LICENSE.txt');
  console.log(`Ready: ${spec.name}@${spec.version}, original LICENSE retained.`);
}

export function buildPlan(lock, options) {
  return {
    mode: options.install ? 'install' : 'dry-run', root,
    prerequisites: [`Node.js >=${lock.nodeMinimum} with npm`, 'Git CLI', 'Unity Editor 6000.6.6f1 Windows + IL2CPP module: install manually only when needed'],
    repositories: lock.repositories.map(({ directory, url, commit, patch }) => ({ directory, url, commit, patch: patch || null })),
    npm: lock.npm.map(({ directory, required }) => ({ directory, command: 'npm ci --ignore-scripts --include=optional --no-audit --no-fund', required })),
    unityRuntimeCopy: lock.unityCopy,
    optionalPuerTS: options.unity ? lock.puerts.packages.map(({ asset, url, sha256, directory }) => ({ asset, url, sha256, directory })) : 'Skipped; add --unity to the plan or --install --unity to execute.',
    compatibilityPatch: options.unity ? lock.puerts.unboxPatch : null,
    safeguards: ['No effects in dry-run: no network, processes, mkdir, or file writes.', 'No reset/clean, no credentials, no Unity install/build.', 'Existing differing source files or unknown editor changes stop installation.', 'npm lifecycle scripts disabled; no browser binary download.', 'Original licenses remain in checkouts/packages and are copied with Unity runtime.']
  };
}

export async function main(args = process.argv.slice(2)) {
  if (args.includes('--help')) {
    console.log('node scripts/bootstrap.mjs [--dry-run] [--unity]\nnode scripts/bootstrap.mjs --install [--unity]\nDefault: print the pinned plan without side effects. Unity Editor is never installed.');
    return;
  }
  const options = parseOptions(args);
  const lock = json(inside('dependencies.lock.json'));
  for (const repo of lock.repositories) if (repo.patch) checkHash(inside(repo.patch), repo.patchSha256);
  checkHash(inside(lock.puerts.unboxPatch.patch), lock.puerts.unboxPatch.patchSha256);
  // Check distributed manifests, but the editor clone is intentionally absent before install.
  for (const spec of lock.npm.filter(item => !item.directory.startsWith('repos/'))) validateNpmSpec(spec);
  console.log(JSON.stringify(buildPlan(lock, options), null, 2));
  if (!options.install) return;
  const current = process.versions.node.split('.').map(Number), minimum = lock.nodeMinimum.split('.').map(Number);
  if (current[0] < minimum[0] || (current[0] === minimum[0] && (current[1] < minimum[1] || (current[1] === minimum[1] && current[2] < minimum[2])))) throw Error(`Node.js >=${lock.nodeMinimum} required.`);
  const cli = npmCli();
  run('git', ['--version']);
  for (const spec of lock.repositories) ensureRepository(spec);
  for (const spec of lock.npm) installNpm(spec, cli);
  copyUnityRuntime(lock);
  if (options.unity) for (const spec of lock.puerts.packages) await ensurePuerTS(spec, lock.puerts.unboxPatch);
  console.log('Bootstrap complete. Unity was not installed or started. See THIRD_PARTY_NOTICES.md before redistributing dependencies.');
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
