import { ItemView, lgui } from 'lgui';
import type { ItemBind } from 'lgui';
import type { {{COMP}}ItemUI } from 'lgui/ui';
import type { {{NAME}}Item } from './{{NAME}}Model';

export class {{COMP}}ItemView extends ItemView<{{COMP}}ItemUI, {{NAME}}Item> {
  static component = '{{PKG}}/{{COMP}}Item';

  bind: ItemBind<{{COMP}}ItemUI, {{NAME}}Item> = {
    label: { text: it => lgui.t('{{feature}}.item', { n: it.n }) },
  };
}
