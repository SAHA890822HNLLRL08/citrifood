import {pruneOrderChats} from "./chat-retention.js";
const KEY="citrifood_mvp";
const ORDER_FLOW={"Nuevo":["Preparando","Rechazado","Cancelado"],"Preparando":["Listo","Rechazado"],"Listo":["Esperando repartidor","En entrega"],"Esperando repartidor":["En entrega"],"En entrega":["Entregado"],"Entregado":[],"Rechazado":[],"Cancelado":[]};
export function canTransitionOrder(from,to){return !!ORDER_FLOW[from]?.includes(to)}
export function loadMvp(){if(typeof window==="undefined")return {orders:[]};try{const data=JSON.parse(localStorage.getItem(KEY)||"null");if(!data||!Array.isArray(data.orders))return {orders:[]};const clean=pruneOrderChats(data);if(clean.changed)localStorage.setItem(KEY,JSON.stringify(clean.state));return clean.state}catch{return {orders:[]}}}
export function saveMvp(value){if(typeof window!=="undefined"){const clean=pruneOrderChats(value).state;localStorage.setItem(KEY,JSON.stringify(clean));window.dispatchEvent(new Event("citrifood:change"))}return pruneOrderChats(value).state}
export function expireStoredChats(){if(typeof window==="undefined")return false;try{const raw=localStorage.getItem(KEY);if(!raw)return false;const data=JSON.parse(raw);const clean=pruneOrderChats(data);if(!clean.changed)return false;localStorage.setItem(KEY,JSON.stringify(clean.state));window.dispatchEvent(new Event("citrifood:change"));return true}catch{return false}}
export function clearMvp(){if(typeof window!=="undefined"){localStorage.removeItem(KEY);window.dispatchEvent(new Event("citrifood:change"))}}
const generatePin=()=>String(Math.floor(1000+Math.random()*9000));
export function createOrder(data){const now=new Date().toISOString();return {...data,id:"CF-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase(),createdAt:now,status:"Nuevo",deliveryPin:generatePin(),deliveryEvents:[],statusHistory:[{status:"Nuevo",at:now}]}}
export function addOrder(data){const order=createOrder(data);const state=loadMvp();saveMvp({...state,orders:[order,...state.orders]});return order}
export function updateOrder(id,changes){const state=loadMvp();let updated=null;const orders=state.orders.map(order=>{if(order.id!==id)return order;if(changes.status&&changes.status!==order.status&&!canTransitionOrder(order.status,changes.status))return order;if(changes.status==="Entregado"&&order.deliveryIssue&&!order.deliveryIssue.resolvedAt)return order;const now=new Date().toISOString();const statusChanged=changes.status&&changes.status!==order.status;updated={...order,...changes,id:order.id,createdAt:order.createdAt,updatedAt:now,statusHistory:statusChanged?[...(order.statusHistory||[]),{status:changes.status,at:now}]:order.statusHistory||[]};return updated});if(updated)saveMvp({...state,orders});return updated}
export function recordDeliveryEvent(id,type,details={}){const order=getOrder(id);if(!order)return null;const at=new Date().toISOString();return updateOrder(id,{deliveryEvents:[...(order.deliveryEvents||[]),{type,at,...details}]})}
export function cancelOrder(id){const order=getOrder(id);if(!order||order.status!=="Nuevo")return null;return updateOrder(id,{status:"Cancelado",cancelledAt:new Date().toISOString(),cancelledBy:"Cliente (demo)"})}
export function getOrder(id){return loadMvp().orders.find(order=>order.id===id)||null}
export function subscribeOrders(callback){if(typeof window==="undefined")return()=>{};window.addEventListener("storage",callback);window.addEventListener("citrifood:change",callback);const onFocus=()=>expireStoredChats();window.addEventListener("focus",onFocus);const timer=setInterval(expireStoredChats,60000);return()=>{clearInterval(timer);window.removeEventListener("focus",onFocus);window.removeEventListener("storage",callback);window.removeEventListener("citrifood:change",callback)}}
export function reportDeliveryIssue(id,description){const order=getOrder(id);const detail=String(description||"").trim();if(!order||order.status!=="En entrega"||order.deliveryIssue&&!order.deliveryIssue.resolvedAt||!detail||detail.length>250)return null;const at=new Date().toISOString();return updateOrder(id,{deliveryIssue:{description:detail,reportedAt:at,resolvedAt:null},deliveryIssueHistory:[...(order.deliveryIssueHistory||[]),{description:detail,reportedAt:at,resolvedAt:null}]})}
export function resolveDeliveryIssue(id){const order=getOrder(id);if(!order?.deliveryIssue||order.deliveryIssue.resolvedAt)return null;const at=new Date().toISOString();return updateOrder(id,{deliveryIssue:{...order.deliveryIssue,resolvedAt:at},deliveryIssueHistory:(order.deliveryIssueHistory||[]).map((issue,i,all)=>i===all.length-1?{...issue,resolvedAt:at}:issue)})}

export function addComplaint(id,complaint){const order=getOrder(id);if(!order||!complaint)return null;return updateOrder(id,{complaints:[...(order.complaints||[]),complaint]})}
export function getOpenComplaints(){return loadMvp().orders.flatMap(order=>(order.complaints||[]).filter(x=>x.status!=="Resuelto").map(x=>({...x,orderId:order.id,restaurant:order.restaurant,courier:order.courier||null})))}

export function addRestaurantPenalty(id,{amount=20,reason="Cancelación atribuible al restaurante"}={}){
 const order=getOrder(id);if(!order)return null;const at=new Date().toISOString();
 const penalty={id:"PEN-"+Date.now().toString(36).toUpperCase(),amount:Math.max(0,Number(amount)||0),reason,at,status:"Pendiente"};
 return updateOrder(id,{restaurantPenalties:[...(order.restaurantPenalties||[]),penalty]});
}
export function cancelAcceptedByRestaurant(id,reason="Producto agotado"){
 const order=getOrder(id);if(!order||order.status!=="Preparando")return null;const at=new Date().toISOString();
 const penalty={id:"PEN-"+Date.now().toString(36).toUpperCase(),amount:20,reason:"Cancelación después de aceptar: "+reason,at,status:"Pendiente"};
 return updateOrder(id,{status:"Rechazado",cancelledAt:at,cancelledBy:"Restaurante",cancellationReason:reason,refundStatus:order.paymentMethod&&String(order.paymentMethod).toLowerCase().includes("efectivo")?"No aplica":"Reembolso solicitado",restaurantPenalties:[...(order.restaurantPenalties||[]),penalty]});
}
export function getRestaurantPenaltyBalance(restaurant){
 return loadMvp().orders.filter(o=>o.restaurant===restaurant).flatMap(o=>o.restaurantPenalties||[]).filter(p=>p.status!=="Aplicada").reduce((sum,p)=>sum+(Number(p.amount)||0),0);
}
