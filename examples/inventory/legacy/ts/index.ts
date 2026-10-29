import { ComplexInventory, InventoryError } from './model.ts';
import type { EquipmentSlot } from './catalog.ts';
export { ComplexInventory, InventoryError } from './model.ts';
export { ITEM_CATALOG, EQUIPMENT_SLOTS, RARITIES } from './catalog.ts';
export type { ComplexItem, StoredItem, SaveData, Category, Sort } from './model.ts';
export type { ItemDefinition, ItemType, Rarity, EquipmentSlot, ItemStats } from './catalog.ts';

export type ComplexInventoryApp = { dispatch(op:string,argsJson?:string):string; snapshot():string };
export function createComplexInventoryApp():ComplexInventoryApp {
  const inventory=new ComplexInventory();
  let open=false, release:(() => void)|null=null, notifications=0, opens=0, closes=0, closedCallbacks=0;
  const response=(op:string,ok=true,result:unknown=null,error?:{code:string;message:string}) => JSON.stringify({ok,op,result,error:error?.message ?? null,errorCode:error?.code ?? null,view:inventory.snapshot(),
    session:{open,listenerCount:inventory.listenerCount,notifications,opens,closes,closedCallbacks,listenerErrors:inventory.listenerErrorCount}});
  const requireString=(args:Record<string,unknown>,key:string) => {
    if(typeof args[key] !== 'string') throw new InventoryError('invalid_args',`${key} 必须为字符串`);
    return args[key] as string;
  };
  return {
    snapshot:() => response('snapshot'),
    dispatch(op:string,argsJson='{}'):string {
      let args:Record<string,unknown>;
      try { args=JSON.parse(argsJson); } catch { return response(op,false,null,{code:'invalid_json',message:'参数不是有效JSON'}); }
      if(!args || typeof args !== 'object' || Array.isArray(args)) return response(op,false,null,{code:'invalid_args',message:'参数必须为JSON对象'});
      try {
        let result:unknown=null;
        switch(op) {
          case 'snapshot': break;
          case 'open':
            if(!open) { open=true; release=inventory.subscribe(() => { if(open) notifications++; else closedCallbacks++; }); opens++; }
            break;
          case 'close':
            if(open) { release?.(); release=null; open=false; closes++; }
            break;
          case 'query': inventory.setQuery(requireString(args,'query')); break;
          case 'category': inventory.setCategory(requireString(args,'category')); break;
          case 'sort': inventory.setSort(requireString(args,'sort')); break;
          case 'select': inventory.select(args.id === null ? null : requireString(args,'id')); break;
          case 'use': result=inventory.use(requireString(args,'id')); break;
          case 'equip': result=inventory.equip(requireString(args,'id')); break;
          case 'unequip': result=inventory.unequip(requireString(args,'slot') as EquipmentSlot); break;
          case 'sell': result=inventory.sell(requireString(args,'id'),args.quantity as number); break;
          case 'rewardQuery': inventory.setRewardQuery(requireString(args,'query')); break;
          case 'progress': result=inventory.progress(); break;
          case 'claim': result=inventory.claim(requireString(args,'id')); break;
          case 'save': result={json:inventory.save()}; break;
          case 'load': result=inventory.load(requireString(args,'json')); break;
          default: throw new InventoryError('unknown_operation',`未知操作: ${String(op)}`);
        }
        return response(op,true,result);
      } catch(error) {
        return response(op,false,null,{code:error instanceof InventoryError ? error.code : 'internal_error',message:error instanceof Error ? error.message : String(error)});
      }
    },
  };
}
