// 找本机的 Chrome 或 Edge（lgui dev 打开网址、lgui doctor 检查环境用）。
import fs from 'node:fs';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';

// 各系统上的候选位置。
export function browserCandidates(platform = process.platform, env = process.env) {
  if (platform === 'darwin') return ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'];
  if (platform === 'win32') {
    const roots = [env.ProgramFiles, env['ProgramFiles(x86)'], env.LocalAppData].filter(Boolean);
    return roots.flatMap(root => [path.join(root, 'Google', 'Chrome', 'Application', 'chrome.exe'), path.join(root, 'Microsoft', 'Edge', 'Application', 'msedge.exe')]);
  }
  return ['google-chrome', 'google-chrome-stable', 'chromium', 'microsoft-edge'];
}

// 返回第一个找得到的浏览器路径；都找不到返回 null。
export function findBrowser({platform = process.platform, env = process.env, exists = fs.existsSync, which = whichCommand} = {}) {
  for (const candidate of browserCandidates(platform, env)) {
    if (path.isAbsolute(candidate) ? exists(candidate) : which(candidate)) return candidate;
  }
  return null;
}

function whichCommand(name) {
  const result = spawnSync('which', [name], {encoding: 'utf8'});
  return result.status === 0 ? result.stdout.trim() : null;
}

// 用找到的浏览器打开网址（不等它退出）。找不到时返回 false。
export function openInBrowser(url) {
  const browser = findBrowser();
  if (!browser) return false;
  const child = spawn(browser, [url], {detached: true, stdio: 'ignore'});
  child.unref();
  return true;
}
