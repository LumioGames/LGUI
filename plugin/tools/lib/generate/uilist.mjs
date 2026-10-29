// lgui ui list 的数据：包 → 组件 → 控件（名字、类型、路径）。
import {members, PORTRAIT} from './types.mjs';

export function listUi(model) {
  return model.packages.map(pkg => ({
    name: pkg.name,
    id: pkg.id,
    components: pkg.components.map(component => ({
      name: component.fullName,
      exported: component.exported,
      portrait: component.name.endsWith(PORTRAIT),
      controls: [...members(component).result].map(([path, member]) => ({path, kind: member.kind, ...(member.pages ? {pages: member.pages} : {}), ...(member.ref ? {ref: member.ref} : {})}))
    }))
  }));
}

export function formatUiList(packages) {
  const lines = [];
  for (const pkg of packages) {
    lines.push(`${pkg.name}（${pkg.id}）`);
    for (const component of pkg.components) {
      const marks = [component.exported ? '导出' : null, component.portrait ? '竖版' : null].filter(Boolean);
      lines.push(`  ${component.name}${marks.length ? `  [${marks.join('，')}]` : ''}`);
      for (const control of component.controls) lines.push(`    ${control.path}  ${control.kind}${control.pages ? `（${control.pages.join(' | ')}）` : ''}${control.ref ? ` → ${control.ref}` : ''}`);
    }
  }
  return lines;
}
