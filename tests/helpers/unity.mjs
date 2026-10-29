// Unity 导出的文件测试输入：只构造工程标识和本地包文件，不包含原生库，不用于 Unity 编译。
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

export const puertsTemplatePath = fileURLToPath(new URL('../fixtures/unity/puerts-3.0.3/Puerts_il2cpp.cpp.txt', import.meta.url));
export const puertsOriginalHash = '318425f7f5eb857b5fc1f664e77b68ff569a99a62641c02ae4819261b0f03aaf';
export const puertsPatchedHash = '3e3b479159fdd56c94ed08f4a7e756dbbfa36b9b4c714e99a40e5fc8f6ec9b83';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');

function template(patched) {
  const bytes = fs.readFileSync(puertsTemplatePath);
  if (digest(bytes) !== puertsOriginalHash) throw new Error('PuerTS 原始测试输入摘要不符。');
  if (!patched) return bytes;
  let text = bytes.toString('utf8');
  const lines = [
    ['return il2cpp::vm::Object::Unbox(obj);', 'return il2cpp_object_unbox(obj);'],
    ['? Object::Unbox(defaultValue) : defaultValue;', '? il2cpp_object_unbox(defaultValue) : defaultValue;'],
    ['void* ptr = Object::Unbox(obj);', 'void* ptr = il2cpp_object_unbox(obj);'],
    ['return DataTransfer::CopyValueType(apis, env, targetClass, Object::Unbox(obj), len);', 'return DataTransfer::CopyValueType(apis, env, targetClass, il2cpp_object_unbox(obj), len);']
  ];
  for (const [before, after] of lines) {
    if (text.split(before).length !== 2) throw new Error('PuerTS 测试补丁的目标行不唯一。');
    text = text.replace(before, after);
  }
  const result = Buffer.from(text, 'utf8');
  if (digest(result) !== puertsPatchedHash) throw new Error('PuerTS 已补测试输入摘要不符。');
  return result;
}

/** 文件测试专用的最小工程；version 和 patched 用于检查导出命令的前置条件。 */
export function createUnityProject(dir, {version = '6000.6.6f1', patched = false} = {}) {
  const root = path.resolve(dir);
  const write = (name, bytes) => {
    const file = path.join(root, name);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, bytes);
  };
  const json = value => JSON.stringify(value, null, 2) + '\n';
  write('ProjectSettings/ProjectVersion.txt', `m_EditorVersion: ${version}\n`);
  write('Packages/manifest.json', json({dependencies: {
    'com.tencent.puerts.core': 'file:com.tencent.puerts.core',
    'com.tencent.puerts.v8': 'file:com.tencent.puerts.v8'
  }}));
  write('Packages/com.tencent.puerts.core/package.json', json({name: 'com.tencent.puerts.core', version: '3.0.3'}));
  write('Packages/com.tencent.puerts.v8/package.json', json({name: 'com.tencent.puerts.v8', version: '3.0.3', dependencies: {'com.tencent.puerts.core': '3.0.3'}}));
  write('Packages/com.tencent.puerts.core/Editor/Resources/puerts/xil2cpp/Puerts_il2cpp.cpp.txt', template(patched));
  return root;
}
