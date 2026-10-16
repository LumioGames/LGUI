import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export function makeCommand(op, args = {}, id = crypto.randomUUID()) {
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,96}$/.test(id)) throw new Error('Command id must contain 1–96 safe filename characters.');
  if (typeof op !== 'string' || !/^[a-z][a-z0-9_-]{0,63}$/.test(op)) throw new Error('A lowercase operation name is required.');
  const argsJson = typeof args === 'string' ? args : JSON.stringify(args);
  const parsed = JSON.parse(argsJson);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Arguments must be a JSON object.');
  return { id, op, argsJson };
}
const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const sameCommand = (left, right) => ['id', 'op', 'argsJson'].every(key => left?.[key] === right[key]);

/** Instrumented file command, not an OS click/keystroke or browser event. */
export async function sendCommand(directory, op, args = {}, options = {}) {
  const dir = path.resolve(directory);
  if (!(await fs.stat(dir)).isDirectory()) throw new Error('The explicit verification directory must already exist.');
  const command = makeCommand(op, args, options.id);
  const timeoutMs = options.timeoutMs ?? 30000;
  const responsePath = path.join(dir, `response-${command.id}.json`);
  const commandPath = path.join(dir, 'command.json');
  const archivePath = path.join(dir, `command-${command.id}.json`);
  const lockPath = path.join(dir, 'command-client.lock');
  let lock;
  const lockId = crypto.randomUUID();
  try {
    lock = await fs.open(lockPath, 'wx');
    await lock.writeFile(JSON.stringify({ pid: process.pid, lockId, id: command.id }));
    let cached;
    try { cached = await readJson(responsePath); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (cached) {
      if (!sameCommand(await readJson(archivePath), command)) throw new Error('Command id was already used with another payload.');
      return cached;
    }
    let pending;
    try { pending = await readJson(commandPath); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (pending && !sameCommand(pending, command)) throw new Error(`The mailbox is busy with command ${pending.id}; it will not be overwritten.`);
    if (!pending) {
      let archived;
      try { archived = await readJson(archivePath); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (archived && !sameCommand(archived, command)) throw new Error('Command id was already used with another payload.');
      if (!archived) {
        const temporary = path.join(dir, `.command-${command.id}.tmp`);
        await fs.writeFile(temporary, JSON.stringify(command), { flag: 'wx' });
        await fs.rename(temporary, commandPath);
      }
    }
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        const response = await readJson(responsePath);
        if (response.id !== command.id) throw new Error('Response id does not match its request.');
        return response;
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
      await sleep(options.pollMs ?? 40);
    }
    throw new Error(`Result unknown for ${command.id}: timed out after ${timeoutMs} ms. Inspect ${responsePath}; retry only the same id and payload.`);
  } finally {
    if (lock) {
      await lock.close();
      try { if ((await readJson(lockPath)).lockId === lockId) await fs.unlink(lockPath); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [directory, op, rawArgs = '{}', ...flags] = process.argv.slice(2);
  if (!directory || !op) throw new Error('Usage: node scripts/command.mjs <verification-directory> <op> [argsJson] [--id id] [--timeout milliseconds]');
  const value = key => { const index = flags.indexOf(key); return index < 0 ? undefined : flags[index + 1]; };
  const response = await sendCommand(directory, op, rawArgs, { id: value('--id'), timeoutMs: value('--timeout') ? Number(value('--timeout')) : undefined });
  console.log(JSON.stringify(response, null, 2));
  if (!response.ok) process.exitCode = 1;
}
