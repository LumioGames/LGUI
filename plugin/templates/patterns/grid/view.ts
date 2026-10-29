import { View, pick } from 'lgui';
import type { Bind, Keys } from 'lgui';
import type { {{COMP}}UI } from 'lgui/ui';
import { {{model}} } from './{{NAME}}Model';
import type { {{NAME}}Item } from './{{NAME}}Model';
import { {{controller}} } from './{{NAME}}Controller';
import { {{COMP}}ItemView } from './{{COMP}}ItemView';

export class {{COMP}}View extends View<{{COMP}}UI> {
  static component = '{{PKG}}/{{COMP}}';
  static layer = 'page' as const;
  static fullScreen = true;

  bind: Bind<{{COMP}}UI> = {
    list: {
      items: pick({{model}}, s => s.items), item: {{COMP}}ItemView, key: (it: {{NAME}}Item) => it.id,
      selected: pick({{model}}, s => s.selectedId), select: id => {{controller}}.select(String(id)),
    },
    closeButton: { click: () => {{controller}}.close() },
  };
  keys: Keys = { back: 'close' };
}
