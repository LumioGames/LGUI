import { Inventory } from '../../prototype/shared/model.ts';

export type InventoryApp = {
  dispatch(op: string, argsJson?: string): string;
  snapshot(): string;
};

/** JSON-only platform boundary. Business rules remain in the shared Inventory. */
export function createInventoryApp(count = 30): InventoryApp {
  if (!Number.isInteger(count) || count < 3 || count > 10000) {
    throw new RangeError('count must be an integer from 3 to 10000');
  }
  const inventory = new Inventory(count);
  let open = false;
  let release: (() => void) | null = null;
  let notifications = 0;
  let opens = 0;
  let closes = 0;
  let closedCallbacks = 0;
  let modelRevision = 0;

  const response = (op: string, ok = true, result: unknown = null, error?: { code: string; message: string }) => JSON.stringify({
    ok, op, result, ...(error ? { error } : {}),
    view: inventory.snapshot(),
    session: { open, listenerCount: inventory.listenerCount, notifications, opens, closes, closedCallbacks, modelRevision, count },
  });
  const fail = (op: string, code: string, message: string) => response(op, false, null, { code, message });

  return {
    snapshot: () => response('snapshot'),
    dispatch(op: string, argsJson = '{}'): string {
      let args: Record<string, unknown>;
      try {
        const parsed = JSON.parse(argsJson);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fail(op, 'invalid_args', 'argsJson must contain an object');
        args = parsed;
      } catch {
        return fail(op, 'invalid_json', 'argsJson must be valid JSON');
      }
      switch (op) {
        case 'snapshot': return response(op);
        case 'open': {
          if (!open) {
            open = true;
            release = inventory.subscribe(() => {
              if (!open) closedCallbacks++;
              else notifications++;
            });
            opens++;
          }
          return response(op);
        }
        case 'close': {
          if (open) {
            release?.();
            release = null;
            open = false;
            closes++;
          }
          return response(op);
        }
        case 'query': {
          if (typeof args.query !== 'string') return fail(op, 'invalid_args', 'query requires a string query');
          inventory.setQuery(args.query);
          modelRevision++;
          return response(op);
        }
        case 'progress': {
          inventory.progress();
          modelRevision++;
          return response(op);
        }
        case 'claim': {
          if (typeof args.id !== 'string') return fail(op, 'invalid_args', 'claim requires a string id');
          const result = inventory.claim(args.id);
          if (result.ok) modelRevision++;
          return response(op, result.ok, result, result.ok ? undefined : { code: 'claim_rejected', message: result.message });
        }
        default: return fail(op, 'unknown_operation', `Unsupported operation: ${String(op)}`);
      }
    },
  };
}
