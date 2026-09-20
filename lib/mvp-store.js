const KEY="citrifood_mvp";
const ORDER_FLOW={"Nuevo":["Preparando","Rechazado"],"Preparando":["Listo","Rechazado"],"Listo":["Esperando repartidor","En entrega"],"Esperando repartidor":["En entrega"],"En entrega":["Entregado"],"Entregado":[],"Rechazado":[]};
export function canTransitionOrder(from,to){return !!ORDER_FLOW[from]?.includes(to)}
export function loadMvp(){if(typeof window==="undefined")return {orders:[]};try{const data=JSON.parse(localStorage.getItem(KEY)||"null");return data&&Array.isArray(data.orders)?data:{orders:[]}}catch{return {orders:[]}}}
export function saveMvp(value){if(typeof window!=="undefined"){localStorage.setItem(KEY,JSON.stringify(value));window.dispatchEvent(new Event("citrifood:change"))}return value}
export function clearMvp(){if(typeof window!=="undefined"){localStorage.removeItem(KEY);window.dispatchEvent(new Event("citrifood:change"))}}
export function createOrder(data){return {id:"CF-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase(),createdAt:new Date().toISOString(),...data,status:"Nuevo"}}
export function addOrder(data){const order=createOrder(data);const state=loadMvp();saveMvp({...state,orders:[order,...state.orders]});return order}
export function updateOrder(id,changes){const state=loadMvp();let updated=null;const orders=state.orders.map(order=>{if(order.id!==id)return order;if(changes.status&&changes.status!==order.status&&!canTransitionOrder(order.status,changes.status))return order;updated={...order,...changes,id:order.id,createdAt:order.createdAt,updatedAt:new Date().toISOString()};return updated});if(updated)saveMvp({...state,orders});return updated}
export function getOrder(id){return loadMvp().orders.find(order=>order.id===id)||null}
export function subscribeOrders(callback){if(typeof window==="undefined")return()=>{};window.addEventListener("storage",callback);window.addEventListener("citrifood:change",callback);return()=>{window.removeEventListener("storage",callback);window.removeEventListener("citrifood:change",callback)}}
