import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../../../plugin/framework/backends/unity/package/Runtime/Platform/Network.cs', import.meta.url), 'utf8');
function body(signature, next) {
  const start = source.indexOf(signature);
  assert.ok(start >= 0, signature);
  return source.slice(start, next ? source.indexOf(next, start + signature.length) : source.length);
}

test('Unity网络启动错误在非yield helper中捕获，保留原始异常以便RT161响应', () => {
  assert.match(source, /static bool TryStartRequest\(/, '真实Player已复现SendWebRequest同步throw，不能只在Fetch外层catch');
  const start = body('static bool TryStartRequest(', 'static IEnumerator Send(');
  assert.match(start, /try[\s\S]*request\.SendWebRequest\(\)[\s\S]*catch\s*\(Exception/);
  assert.doesNotMatch(start, /yield\s+return/);
  assert.match(start, /startupError\s*=\s*error/);
});

test('Unity Fetch启动失败完成一次status0回调，先检查代际和owner，再由finally释放请求', () => {
  const send = body('static IEnumerator Send(', 'static void RequireHttp(');
  assert.match(send, /TryStartRequest\(request,/);
  const failed = send.indexOf('if (!TryStartRequest(');
  assert.ok(failed >= 0, '发送前须显式处理启动失败');
  const yieldSuccess = send.indexOf('yield return operation');
  assert.ok(yieldSuccess > failed);
  const failureBranch = send.slice(failed, yieldSuccess);
  assert.match(failureBranch, /startedGeneration != generation \|\| owner == null/);
  assert.equal((failureBranch.match(/complete\(/g) ?? []).length, 1);
  assert.ok(failureBranch.indexOf('owner == null') < failureBranch.indexOf('complete('));
  assert.match(failureBranch, /status\s*=\s*0/);
  assert.match(failureBranch, /Failure\([\s\S]*startupError[\s\S]*\.ToString\(\)/);
  assert.match(failureBranch, /yield break;/);
  assert.match(send, /finally\s*\{\s*Untrack\(request\);\s*request\.Dispose\(\);\s*\}/);
});

test('实证相同音频启动异常走RT161日志出口，yield前检查生命周期并保证finally清理', () => {
  const audio = body('static IEnumerator DownloadSound(');
  assert.match(audio, /if \(!TryStartRequest\(request,/);
  const failure = audio.slice(audio.indexOf('if (!TryStartRequest('), audio.indexOf('yield return operation'));
  assert.match(failure, /startedGeneration != generation \|\| owner == null/);
  assert.match(failure, /Log\("error",\s*Failure\([\s\S]*startupError[\s\S]*\.ToString\(\)/);
  assert.match(failure, /yield break;/);
  assert.match(audio, /finally\s*\{\s*Untrack\(request\);\s*request\.Dispose\(\);\s*\}/);
});

test('实证纹理启动异常完成既有失败回调并移除entry，回调重入关闭后不派发给旧代次', () => {
  const cache = fs.readFileSync(new URL('../../../plugin/framework/backends/unity/package/Runtime/Platform/ExternalImageCache.cs', import.meta.url), 'utf8');
  assert.match(cache, /generation\s*=\s*Platform\.RequestGeneration/);
  assert.match(cache, /if \(!Platform\.TryStartRequest\(request,[\s\S]*Failed\(entry\);\s*yield break;/);
  assert.match(cache, /foreach \(var waiter in waiters\)\s*\{\s*if \(!Platform\.IsRequestCurrent\(entry\.generation\)\) break;\s*waiter\.failed\(\);/);
  assert.match(cache, /entries\.Remove\(entry\.url\);[\s\S]*entry\.waiters\.Clear\(\)/);
  assert.match(cache, /finally[\s\S]*entry\.request = null;\s*Platform\.Untrack\(request\);\s*request\.Dispose\(\);/);
});
