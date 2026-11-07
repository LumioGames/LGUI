// 输入法组字状态：Web 目标下监听 document 的 composition 事件（cc 的 EditBox 在 Web 上聚焦的是
// 真实 input 元素，组字事件会冒泡到 document）。原生目标没有等价物，isComposing 恒 false（T012 原生阶段再接）。
let composing = false;
let installed = false;

export function installImeTracking(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener('compositionstart', () => { composing = true; });
  document.addEventListener('compositionend', () => { composing = false; });
}

export function isComposing(): boolean {
  return composing;
}
