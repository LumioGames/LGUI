import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import childProcess from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';

async function fixture() {
  const api = await import('../../unity/player-runner.mjs').catch(() => ({}));
  assert.equal(typeof api.readPlayerEvidence, 'function', 'Release Player must validate process, native errors and result independently');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-player-evidence-'));
  const result = path.join(root, 'result.json'), log = path.join(root, 'Player.log');
  fs.writeFileSync(result, JSON.stringify({ok: true, result: {data: {clicks: 2}}}));
  fs.writeFileSync(log, 'Initialize engine version: 6000.6.6f1\nInput System module state changed to: Shutdown.\n');
  return {api, root, result, log};
}

async function recordPlayerMode(options) {
  const {api, root} = await fixture();
  const spawn = childProcess.spawn;
  const result = path.join(root, 'mode.json'), log = path.join(root, 'mode.log');
  let invocation, started;
  childProcess.spawn = (executable, args, spawnOptions) => {
    invocation = {executable, args: [...args], options: {...spawnOptions}};
    // A real owned Node process writes valid evidence and exits; only the
    // executable is substituted so this target test never launches Unity.
    const code = `const fs=require('node:fs'); const a=process.argv.slice(1);
const at=n=>a[a.indexOf(n)+1];
fs.writeFileSync(at('-lguiResult'),JSON.stringify({ok:true,result:{modeProbe:true}}));
fs.writeFileSync(at('-logFile'),'controlled child completed\\n');`;
    return spawn(process.execPath, ['-e', code, '--', ...args], spawnOptions);
  };
  syncBuiltinESMExports();
  try {
    const output = await api.runPlayer({player: process.execPath, scenario: 'binding-language', result, log,
      ...options, onStarted: value => { started = value; }});
    assert.equal(output.result.modeProbe, true);
    return {invocation, started, recorded: JSON.parse(fs.readFileSync(result + '.process.json', 'utf8'))};
  } finally {
    childProcess.spawn = spawn;
    syncBuiltinESMExports();
    fs.rmSync(root, {recursive: true, force: true});
  }
}

test('Player runner defaults to hidden batch mode and records the actual mode and launch arguments', async () => {
  const {invocation, started, recorded} = await recordPlayerMode({});
  assert.equal(invocation.options.windowsHide, true);
  assert.equal(invocation.args.includes('-batchmode'), true);
  assert.deepEqual(invocation.args.slice(1, 7), ['-screen-width', '1280', '-screen-height', '720', '-screen-fullscreen', '0']);
  assert.equal(started.graphical, false);
  assert.equal(recorded.graphical, false);
  assert.deepEqual(started.args, invocation.args);
  assert.deepEqual(recorded.args, invocation.args);
  assert.equal(recorded.exitCode, 0);
});

test('Player runner graphical true launches a visible window without batch mode and preserves real screen arguments', async () => {
  const {invocation, started, recorded} = await recordPlayerMode({graphical: true, width: 800, height: 450});
  assert.equal(invocation.options.windowsHide, false);
  assert.equal(invocation.args.includes('-batchmode'), false);
  assert.deepEqual(invocation.args.slice(0, 6), ['-screen-width', '800', '-screen-height', '450', '-screen-fullscreen', '0']);
  assert.equal(started.graphical, true);
  assert.equal(recorded.graphical, true);
  assert.deepEqual(started.args, invocation.args);
  assert.deepEqual(recorded.args, invocation.args);
});

test('Player runner rejects non-boolean graphical API options before spawning any process', async () => {
  const {api, root} = await fixture();
  const spawn = childProcess.spawn;
  let spawned = false;
  childProcess.spawn = () => { spawned = true; throw new Error('must validate before spawning'); };
  syncBuiltinESMExports();
  try {
    for (const graphical of ['true', 'false', 1, 0, null]) {
      await assert.rejects(api.runPlayer({player: process.execPath, scenario: 'binding-language', graphical,
        result: path.join(root, 'invalid.json'), log: path.join(root, 'invalid.log')}), /LGUI-RT-001.*graphical.*boolean/);
    }
    assert.equal(spawned, false);
  } finally {
    childProcess.spawn = spawn;
    syncBuiltinESMExports();
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('Player runner CLI accepts only the explicit --graphical true literal', () => {
  const script = path.resolve('tests/unity/player-runner.mjs');
  for (const value of ['false', '1', 'TRUE', 'yes']) {
    const result = childProcess.spawnSync(process.execPath, [script, 'run', '--graphical', value], {encoding: 'utf8', windowsHide: true});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /LGUI-RT-001.*--graphical.*true/);
  }
});

test('Player runner accepts actual completion only after a successful process exit', async () => {
  const {api, result, log} = await fixture();
  assert.deepEqual(api.readPlayerEvidence({result, log, exitCode: 0}).result, {data: {clicks: 2}});
  assert.throws(() => api.readPlayerEvidence({result, log, exitCode: 1}), /LGUI-RT-001.*exited 1/);
});

test('Player runner rejects a success JSON followed by teardown errors', async () => {
  const {api, result, log} = await fixture();
  fs.writeFileSync(result + '.errors.json', JSON.stringify({errors: ['Exception: teardown failed']}));
  assert.throws(() => api.readPlayerEvidence({result, log, exitCode: 0}), /LGUI-RT-001.*native errors/);
  fs.unlinkSync(result + '.errors.json');
  fs.appendFileSync(log, 'LGUI-RT-160 LGUIBoot.cs: TypeScript disposal failed\n');
  assert.throws(() => api.readPlayerEvidence({result, log, exitCode: 0}), /LGUI-RT-001.*Player.log/);
});

test('Player runner rejects missing, failed and malformed native results', async () => {
  const {api, result, log} = await fixture();
  fs.writeFileSync(result, JSON.stringify({ok: false, error: 'LGUI-RT-001 test failed'}));
  assert.throws(() => api.readPlayerEvidence({result, log, exitCode: 0}), /LGUI-RT-001.*test failed/);
  fs.writeFileSync(result, '{broken');
  assert.throws(() => api.readPlayerEvidence({result, log, exitCode: 0}), /LGUI-RT-001/);
  fs.unlinkSync(result);
  assert.throws(() => api.readPlayerEvidence({result, log, exitCode: 0}), /LGUI-RT-001/);
});

test('Player runner waits for its actual child to close before reporting a startup-hook failure', async () => {
  const {api, root} = await fixture();
  const spawn = childProcess.spawn;
  const original = new Error('LGUI-RT-001 controlled startup hook failure');
  let child, terminate, terminated, delayedKill;
  // Use a real process. Delay only delivery of its termination request so that
  // rejecting before close leaves an observable, still-running owned PID.
  childProcess.spawn = () => {
    child = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)'], {windowsHide: true, stdio: 'ignore'});
    terminate = child.kill.bind(child);
    terminated = new Promise(resolve => child.once('close', resolve));
    child.kill = () => { delayedKill = setTimeout(() => terminate(), 100); return true; };
    return child;
  };
  syncBuiltinESMExports();
  try {
    await assert.rejects(api.runPlayer({player: process.execPath, scenario: 'binding-language',
      result: path.join(root, 'fresh.json'), log: path.join(root, 'fresh.log'),
      onStarted: async () => { throw original; }}), error => error === original);
    assert.throws(() => process.kill(child.pid, 0), error => error.code === 'ESRCH', 'Rejected while the child PID still existed');
  } finally {
    childProcess.spawn = spawn;
    syncBuiltinESMExports();
    clearTimeout(delayedKill);
    if (child?.exitCode === null) terminate();
    if (terminated) await terminated;
  }
});

test('Player runner preserves its timeout when terminating the child aborts the startup hook', async () => {
  const {api, root} = await fixture();
  const spawn = childProcess.spawn;
  const aborted = new Error('LGUI-RT-001 controlled Inspector operation was aborted');
  let child, terminate, terminated, delayedKill, observedAbort = false;
  // Keep a real owned child alive until the runner's deadline terminates it.
  childProcess.spawn = () => {
    child = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)'], {windowsHide: true, stdio: 'ignore'});
    terminate = child.kill.bind(child);
    terminated = new Promise(resolve => child.once('close', resolve));
    child.kill = () => { delayedKill = setTimeout(() => terminate(), 100); return true; };
    return child;
  };
  syncBuiltinESMExports();
  try {
    await assert.rejects(api.runPlayer({player: process.execPath, scenario: 'binding-language', timeoutMs: 100,
      result: path.join(root, 'timeout.json'), log: path.join(root, 'timeout.log'),
      onStarted: async ({signal}) => new Promise((_, reject) => {
        signal.addEventListener('abort', () => { observedAbort = true; reject(aborted); }, {once: true});
      })}), /LGUI-RT-001.*Player timed out after 100ms/);
    assert.ok(observedAbort, 'Child close must actually abort the pending startup hook');
    assert.throws(() => process.kill(child.pid, 0), error => error.code === 'ESRCH', 'Rejected while the timed-out child PID still existed');
  } finally {
    childProcess.spawn = spawn;
    syncBuiltinESMExports();
    clearTimeout(delayedKill);
    if (child?.exitCode === null) terminate();
    if (terminated) await terminated;
  }
});

test('Player runner preserves an earlier startup-hook failure when child close crosses the deadline', async () => {
  const {api, root} = await fixture();
  const spawn = childProcess.spawn;
  const original = new Error('LGUI-RT-001 earlier startup hook failure');
  let child, terminate, terminated, delayedKill;
  childProcess.spawn = () => {
    child = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)'], {windowsHide: true, stdio: 'ignore'});
    terminate = child.kill.bind(child);
    terminated = new Promise(resolve => child.once('close', resolve));
    // The hook fails first; its termination reaches the real child after 100ms,
    // beyond the runner's 50ms deadline. Neither cause may skip waiting for close.
    child.kill = () => { delayedKill = setTimeout(() => terminate(), 100); return true; };
    return child;
  };
  syncBuiltinESMExports();
  try {
    await assert.rejects(api.runPlayer({player: process.execPath, scenario: 'binding-language', timeoutMs: 50,
      result: path.join(root, 'first-cause.json'), log: path.join(root, 'first-cause.log'),
      onStarted: async () => { throw original; }}), error => error === original);
    assert.throws(() => process.kill(child.pid, 0), error => error.code === 'ESRCH', 'Rejected while the failed child PID still existed');
  } finally {
    childProcess.spawn = spawn;
    syncBuiltinESMExports();
    clearTimeout(delayedKill);
    if (child?.exitCode === null) terminate();
    if (terminated) await terminated;
  }
});
