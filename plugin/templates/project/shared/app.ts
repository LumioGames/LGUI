// Pure application state. Rendering, fonts, events and persistence belong to adapters.
export function createUIApp(){
 let title='UI project';
 return {snapshot:()=>({title}),setTitle(value:string){if(typeof value!=='string'||!value.trim())throw Error('A nonempty title is required.');title=value;}};
}
