import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { parseOptions, safeArchivePath, decideFileAction, patchUnbox, canonicalTextSha256 } from './bootstrap.mjs';

test('text provenance hashes tolerate Git CRLF checkout without changing binary archive hashes', () => {
  assert.equal(canonicalTextSha256(Buffer.from('a\r\nb\r\n')), canonicalTextSha256(Buffer.from('a\nb\n')));
  assert.notEqual(canonicalTextSha256(Buffer.from('user edit\n')), canonicalTextSha256(Buffer.from('a\nb\n')));
});

test('default is a side-effect-free plan and Unity is opt-in', () => {
  assert.deepEqual(parseOptions([]), { install: false, unity: false });
  assert.deepEqual(parseOptions(['--unity']), { install: false, unity: true });
  assert.deepEqual(parseOptions(['--install', '--unity']), { install: true, unity: true });
  assert.throws(() => parseOptions(['--install', '--dry-run']), /mutually exclusive/);
  assert.throws(() => parseOptions(['--force']), /Unknown option/);
});

test('archive names remain inside the expected release root', () => {
  assert.equal(safeArchivePath('core/Editor/Resources/x.txt', 'core'), 'Editor/Resources/x.txt');
  assert.equal(safeArchivePath('core/', 'core'), '');
  for (const name of ['core/../../outside', '/core/a', 'core/C:/a', 'core\\..\\outside', 'v8/a', 'core/a/../b']) {
    assert.throws(() => safeArchivePath(name, 'core'), /Unsafe archive path/);
  }
});

test('existing identical files are skipped and differing user files are rejected', () => {
  const expected = Buffer.from('original');
  assert.equal(decideFileAction(null, expected), 'write');
  assert.equal(decideFileAction(Buffer.from('original'), expected), 'skip');
  assert.throws(() => decideFileAction(Buffer.from('user edit'), expected), /Refusing to overwrite/);
});

test('unbox patch is pinned, changes exactly four calls, and is idempotent', () => {
  const original = Buffer.from('a Object::Unbox(x);\nb il2cpp::vm::Object::Unbox(x);\nc Object::Unbox(x);\nd Object::Unbox(x);\n');
  const patched = Buffer.from(original.toString().replaceAll('il2cpp::vm::Object::Unbox(', 'il2cpp_object_unbox(').replaceAll('Object::Unbox(', 'il2cpp_object_unbox('));
  const sha = b => createHash('sha256').update(b).digest('hex');
  const contract = { originalSha256: sha(original), patchedSha256: sha(patched), replacements: 4 };
  assert.deepEqual(patchUnbox(original, contract), patched);
  assert.deepEqual(patchUnbox(patched, contract), patched);
  assert.throws(() => patchUnbox(Buffer.from('user edit'), contract), /Unknown PuerTS source/);
});
