import { lgui } from 'lgui';
import { MainView } from './modules/main/MainView';

export default lgui.app({
  backend: 'h5',
  async start() {
    await lgui.ui.open(MainView);
  },
});
