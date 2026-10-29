import { PartView, pick, format } from 'lgui';
import type { Bind } from 'lgui';
import type { CurrencyBarUI } from 'lgui/ui';
import { bagModel } from '../bag/BagModel';

/** 货币栏：背包和商店共用的部件。 */
export class CurrencyBarView extends PartView<CurrencyBarUI> {
  static component = 'Common/CurrencyBar';

  bind: Bind<CurrencyBarUI> = {
    amount: { text: pick(bagModel, s => s.coins, format.number) },
  };
}
