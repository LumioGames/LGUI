import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export function checkRemoteImageResult(report) {
  assert.equal(report.fatal, undefined, report.fatal);
  assert.equal(report.placeholderWhileDownloading, true, 'placeholder must stay visible during initial preload');
  assert.equal(report.afterOneShotServer.counts['/one-shot.png'], 1, 'preload and real display must share the same HTTP result');
  assert.equal(report.targetTexturePresent, true, 'the target must receive the already loaded texture');
  assert.equal(report.blankFramesAfterAssignment, 0, 'a successful preload must not create an empty target frame');
  assert.equal(report.concurrentRequests, 1, 'simultaneous preload and display must share a request');
  assert.equal(report.concurrentShareTexture, true, 'simultaneous display must share the downloaded texture');
  assert.equal(report.secondAliveAfterFirstCloses, true, 'closing one loader must keep the second loader texture alive');
  assert.equal(report.texturesAfterBothClose, report.baselineTextures, 'last consumer closing must release its texture');
  assert.equal(report.initial404KeepsPlaceholder, true, 'initial 404 must keep the placeholder');
  assert.equal(report.initial404Reported070, true, 'initial 404 must report LGUI-RT-070');
  assert.equal(report.closedBeforeDownloadIsDisposed, true);
  assert.equal(report.shutdownPendingRejected, true);
  assert.equal(report.texturesAfterAbandonedPreload, report.baselineTextures, 'unconsumed preload must release its texture');
  assert.equal(report.clearedUrlStaysEmpty, true, 'a late response must not replace an empty URL');
  assert.equal(report.switchedUrlKeepsPlaceholder, true, 'a late response must not replace a package image');
  assert.equal(report.texturesAfterUrlCancellation, report.baselineTextures, 'unclaimed URL-change results must release their textures');
  assert.ok(report.logs.every(log => log.level !== 'error' || (log.message.includes('LGUI-RT-070') && log.message.includes(report.base + '/missing.png'))), 'all error logs must be explicitly expected');
  const http = report.nativeHttp;
  assert.equal(http.get.status, 200); assert.equal(http.get.ok, true);
  assert.equal(http.get.json.method, 'GET'); assert.equal(http.get.json.body, ''); assert.deepEqual(JSON.parse(http.get.text), http.get.json);
  assert.equal(http.post.status, 200); assert.equal(http.post.ok, true);
  assert.equal(http.post.json.method, 'POST'); assert.equal(http.post.json.body, http.post.payload);
  assert.equal(http.post.json.probeHeader, 'native'); assert.equal(http.post.json.contentType, 'application/json');
  assert.deepEqual(JSON.parse(http.post.text), http.post.json);
  assert.equal(http.notFound.status, 404); assert.equal(http.notFound.ok, false);
  assert.deepEqual(http.notFound.json, {error: 'fixture missing'}); assert.deepEqual(JSON.parse(http.notFound.text), http.notFound.json);
  assert.equal(http.drop.rejected, true); assert.equal(http.drop.code, 'LGUI-RT-101');
  for (const name of ['readyReentry', 'failedReentry']) {
    assert.equal(report[name].nested, 1, `${name} must actually enter the synchronous callback`);
    assert.equal(report[name].request.closedBeforeWrite, true, `${name} must abort B before the delayed server response`);
    assert.ok(report[name].request.closed < report[name].request.scheduledWrite, `${name} close must precede the scheduled write`);
    assert.equal(report[name].request.writeStarted, undefined, `${name} must not complete an uncancelled B download`);
  }
  assert.equal(report.texturesAfterReentry, report.baselineTextures, 'reentrant cancellation must release all textures');
  return report;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2]; checkRemoteImageResult(JSON.parse(fs.readFileSync(file, 'utf8')));
  console.log(JSON.stringify({ok: true, file}));
}
