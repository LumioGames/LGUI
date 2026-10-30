// 新控件的测试界面：Controls 包（输入框、滑动条、下拉框、标签、序列帧动画、树、齿轮和组）。一致性测试和单元测试都用它。
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {png} from '../helpers/fixture.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

/** 一个最小的序列帧文件（.jta，FairyGUI 的格式）：frames 帧，每帧一张 size×size 的纯色图。 */
export function jta(frames = 2, size = 64) {
  const image = png(size, size, [255, 0, 0]);
  const u16 = v => { const b = Buffer.alloc(2); b.writeUInt16BE(v); return b; };
  const i16 = v => { const b = Buffer.alloc(2); b.writeInt16BE(v); return b; };
  const i32 = v => { const b = Buffer.alloc(4); b.writeInt32BE(v); return b; };
  // 文件头 yytou、版本 101、24 帧每秒；速度 1、不停顿、不来回；每帧：延迟、矩形、图片序号；图片；最后是边界。
  const parts = [u16(5), Buffer.from('yytou'), i32(101), Buffer.from([24, 0, 0, 0]), Buffer.from([1, 0, 0]), i16(frames)];
  for (let i = 0; i < frames; i++) parts.push(i16(0), i16(0), i16(0), i16(size), i16(size), i16(0));
  parts.push(i16(1), i32(image.length), image, Buffer.alloc(4), u16(size), u16(size));
  return Buffer.concat(parts);
}

/** 把 Controls 包写进工程的 ui/assets/。buttonId 是工程里 Common/Button 的资源 ID（lgui init 的模板是 button01）。 */
export function writeControls(root, {buttonId = 'button01'} = {}) {
  const dest = path.join(root, 'ui', 'assets', 'Controls');
  fs.mkdirSync(dest, {recursive: true});
  for (const file of fs.readdirSync(path.join(here, 'ui', 'Controls'))) {
    const text = fs.readFileSync(path.join(here, 'ui', 'Controls', file), 'utf8');
    fs.writeFileSync(path.join(dest, file), text.replaceAll('src="button01"', `src="${buttonId}"`));
  }
  fs.writeFileSync(path.join(dest, 'spin.jta'), jta());
  return dest;
}
