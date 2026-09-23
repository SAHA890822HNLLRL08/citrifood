import {getOrder,updateOrder} from "./mvp-store.js";
const ROLES=["Cliente","Repartidor"];
const ACTIVE=["Nuevo","Preparando","Listo","Esperando repartidor","En entrega"];
export function canMessageOrder(order,role){return Boolean(order&&ACTIVE.includes(order.status)&&ROLES.includes(role)&&(!["Repartidor"].includes(role)||Boolean(order.courier)))}
export function sendOrderMessage(orderId,role,body){
 const order=getOrder(orderId);
 const message=String(body??"").trim();
 if(!canMessageOrder(order,role)||!message||message.length>500)return null;
 const at=new Date().toISOString();
 const entry={id:"MSG-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,6),role,body:message,at};
 const updated=updateOrder(orderId,{messages:[...(order.messages||[]),entry]});
 return updated?entry:null;
}
export function orderMessages(order){return Array.isArray(order?.messages)?order.messages.filter(x=>ROLES.includes(x.role)&&typeof x.body==="string"):[]}
