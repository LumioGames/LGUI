// cocos 的剪贴板：Web 目标用浏览器的 navigator.clipboard（只有 https 或 localhost 能用，语义同 h5）。
// 原生目标没有系统剪贴板 API，读写报 LGUI-RT-241（T012 原生阶段再接）。
import type {ClipboardService} from '../../../core/index';
import {LgRuntimeError} from '../../../core/index';

const failed = (what: string, detail: string): LgRuntimeError =>
  new LgRuntimeError('LGUI-RT-241', `剪贴板${what}失败：${detail}`, '网页只有 https 或 localhost 的页面能用剪贴板；写入放在点击动作里直接调用（不要先 await 别的）；读取要用户在浏览器的提示里允许。');

const reason = (error: unknown): string => error instanceof Error ? `${error.name}: ${error.message}` : String(error);

export function createCocosClipboard(): ClipboardService {
  const api = (): Clipboard | null => (typeof navigator !== 'undefined' && navigator.clipboard) || null;
  return {
    async writeText(text) {
      const clipboard = api();
      if (!clipboard) throw failed('写入', '这个环境不能用剪贴板（navigator.clipboard 不存在）');
      try { await clipboard.writeText(text); } catch (error) { throw failed('写入', reason(error)); }
    },
    async readText() {
      const clipboard = api();
      if (!clipboard) throw failed('读取', '这个环境不能用剪贴板（navigator.clipboard 不存在）');
      try { return await clipboard.readText(); } catch (error) { throw failed('读取', reason(error)); }
    }
  };
}
