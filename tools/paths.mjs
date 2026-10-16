import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
export function resolved(location) {
  const absolute = path.resolve(location);
  if (fs.existsSync(absolute)) return fs.realpathSync(absolute);
  const parent = path.dirname(absolute);
  if (parent === absolute) return absolute;
  return path.join(resolved(parent), path.basename(absolute));
}
export const within = (root, target) => {
  const relative = path.relative(root, target);
  return !relative || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
};
export function contained(root, relative) {
  if (!relative || relative.includes('\\') || relative.includes(':') || relative.split('/').some(p => !p || p === '.' || p === '..')) throw Error(`Unsafe package path: ${relative}`);
  const target = path.resolve(root, relative);
  if (!within(resolved(root), resolved(target))) throw Error(`Path escapes root: ${relative}`);
  let current = target;
  while (current !== path.resolve(root)) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw Error(`Link not allowed: ${relative}`);
    current = path.dirname(current);
  }
  return target;
}
export function filesUnder(root, relative) {
  const target = contained(root, relative);
  if (!fs.existsSync(target)) throw Error(`Missing package input: ${relative}`);
  if (fs.statSync(target).isFile()) return [relative];
  return fs.readdirSync(target).sort().flatMap(name => filesUnder(root, relative + '/' + name));
}
