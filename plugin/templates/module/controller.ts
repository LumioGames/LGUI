import { Controller{{LGUI_IMPORT}} } from 'lgui';
import { {{model}} } from './{{NAME}}Model';
{{VIEW_IMPORT}}
export class {{NAME}}Controller extends Controller {
  select(id: string) { {{model}}.select(id); }
{{VIEW_METHODS}}}
export const {{controller}} = new {{NAME}}Controller();
