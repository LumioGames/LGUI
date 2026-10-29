import { createInventoryApp, type InventoryApp } from './inventory-app.ts';

const host = globalThis as typeof globalThis & {
  inventoryInitialCount?: number;
  inventoryApp?: InventoryApp;
};

// One app per JS environment. Evaluating the bundle again preserves business state.
if (!host.inventoryApp) host.inventoryApp = createInventoryApp(host.inventoryInitialCount ?? 30);
