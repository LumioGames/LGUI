import { Controller{{LGUI_IMPORT}} } from 'lgui';
import { {{model}} } from './{{NAME}}Model';
{{VIEW_IMPORT}}
export class {{NAME}}Controller extends Controller {
  select(id: string) { {{model}}.select(id); }
  switchTab(tab: 'first' | 'second') { {{model}}.switchTab(tab); }
{{VIEW_METHODS}}}
export const {{controller}} = new {{NAME}}Controller();
