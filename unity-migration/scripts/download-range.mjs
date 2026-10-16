import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

// Official URL only; every returned range and the assembled integrity are checked.
const [url, output, sizeText, integrity = '', concurrencyText = '6'] = process.argv.slice(2);
const size = Number(sizeText), concurrency = Number(concurrencyText), chunkSize = 16 * 1024 * 1024;
if (!url?.startsWith('https://') || !output || !Number.isSafeInteger(size) || size < 1) throw new Error('Usage: URL output totalBytes [algorithm-base64] [concurrency]');
const destination = path.resolve(output), chunks = destination + '.parts';
await fs.mkdir(chunks, { recursive: true });
let next = 0, completed = 0;
const total = Math.ceil(size / chunkSize), started = Date.now();
const run = args => new Promise((resolve, reject) => {
  const child = spawn('curl.exe', args, { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  let error = ''; child.stderr.on('data', data => { error += data; });
  child.on('error', reject); child.on('exit', code => code === 0 ? resolve() : reject(new Error(`curl exit ${code}: ${error}`)));
});
await Promise.all(Array.from({ length: concurrency }, async () => {
  for (;;) {
    const index = next++;
    if (index >= total) break;
    const start = index * chunkSize, end = Math.min(size - 1, start + chunkSize - 1);
    const file = path.join(chunks, String(index).padStart(5, '0') + '.bin'), headers = file + '.headers';
    const check = async () => {
      const stat = await fs.stat(file).catch(() => null), header = await fs.readFile(headers, 'utf8').catch(() => '');
      return stat?.size === end - start + 1 && header.toLowerCase().includes(`content-range: bytes ${start}-${end}/${size}`);
    };
    if (!await check()) {
      await run(['--fail', '--location', '--connect-timeout', '15', '--max-time', '90', '--retry', '2', '--range', `${start}-${end}`, '--silent', '--show-error', '--dump-header', headers, '--output', file, url]);
      if (!await check()) throw new Error(`Invalid Content-Range or size for chunk ${index}`);
    }
    completed++;
    if (completed % 4 === 0 || completed === total) console.log(JSON.stringify({ file: path.basename(destination), completed, total, downloaded: Math.min(completed * chunkSize, size), seconds: Math.round((Date.now() - started) / 1000) }));
  }
}));
const target = await fs.open(destination, 'w');
const sha256 = createHash('sha256');
const split = integrity.indexOf('-'), algorithm = split > 0 ? integrity.slice(0, split) : null;
const expected = algorithm ? createHash(algorithm) : null;
try {
  for (let index = 0; index < total; index++) {
    const bytes = await fs.readFile(path.join(chunks, String(index).padStart(5, '0') + '.bin'));
    sha256.update(bytes); expected?.update(bytes); await target.write(bytes);
  }
} finally { await target.close(); }
const actualIntegrity = expected ? `${algorithm}-${expected.digest('base64')}` : null;
if (integrity && integrity !== actualIntegrity) throw new Error(`Integrity mismatch: ${actualIntegrity}`);
const report = { source: url, output: destination, size, sha256: sha256.digest('hex'), expectedIntegrity: integrity || null, actualIntegrity, ranges: total, seconds: (Date.now() - started) / 1000 };
await fs.writeFile(destination + '.verified.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ verified: true, ...report }));
