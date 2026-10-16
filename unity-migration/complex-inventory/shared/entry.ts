import {createComplexInventoryApp} from './index.ts';
const g=globalThis as any;
if(!g.complexInventoryApp) g.complexInventoryApp=createComplexInventoryApp();
