import { View, pick } from 'lgui';
import type { Bind, Keys } from 'lgui';
import type { {{COMP}}UI } from 'lgui/ui';
import { {{model}} } from './{{NAME}}Model';
import { {{controller}} } from './{{NAME}}Controller';

export class {{COMP}}View extends View<{{COMP}}UI> {
  static component = '{{PKG}}/{{COMP}}';
  static layer = 'page' as const;
  static fullScreen = true;

  bind: Bind<{{COMP}}UI> = {
    tabs: { page: pick({{model}}, s => s.tab), change: tab => {{controller}}.switchTab(tab) },
    firstTab: { click: () => {{controller}}.switchTab('first') },
    secondTab: { click: () => {{controller}}.switchTab('second') },
    closeButton: { click: () => {{controller}}.close() },
  };
  keys: Keys = { back: 'close' };
}
