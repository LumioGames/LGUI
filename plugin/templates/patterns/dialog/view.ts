import { View } from 'lgui';
import type { Bind, Keys } from 'lgui';
import type { {{COMP}}UI } from 'lgui/ui';
import { {{controller}} } from './{{NAME}}Controller';

export class {{COMP}}View extends View<{{COMP}}UI> {
  static component = '{{PKG}}/{{COMP}}';
  static layer = 'popup' as const;

  bind: Bind<{{COMP}}UI> = {
    okButton: { click: () => {{controller}}.confirm() },
    closeButton: { click: () => {{controller}}.close() },
  };
  keys: Keys = { back: 'close', confirm: { do: () => {{controller}}.confirm() } };
}
