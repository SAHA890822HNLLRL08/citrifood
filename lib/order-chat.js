import {getOrder,updateOrder} from "./mvp-store.js";
const ROLES=["Cliente","Repartidor"];
const ACTIVE=["En entrega"];
// Block attempts to exchange direct contact details in the demo chat.
export function containsContactDetails(value){const text=String(value??"");const digits=text.replace(/[^0-9]/g,"");return /(?:\+?52[\s.()-]*)?(?:\d[\s.()-]*){10,}/.test(text)||/\b(?:whats\s*app|wa\.me|tel(?:egram)?|https?:\/\/|www\.|@)\b/i.test(text)||digits.length>=10&&/\b(?:cel|tel[eé]fono|n[uú]mero|ll[aá]mame|contacto)\b/i.test(text)}
export function canMessageOrder(order,role){return Boolean(order&&ACTIVE.includes(order.status)&&ROLES.includes(role)&&Boolean(order.courier))}
export function sendOrderMessage(orderId,role,body){
 const order=getOrder(orderId);
 const message=String(body??"").trim();
 if(!canMessageOrder(order,role)||!message||message.length>500||containsContactDetails(message))return null;
 const at=new Date().toISOString();
 const entry={id:"MSG-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,6),role,body:message,at};
 const updated=updateOrder(orderId,{messages:[...(order.messages||[]),entry]});
 return updated?entry:null;
}
export function orderMessages(order){return Array.isArray(order?.messages)?order.messages.filter(x=>ROLES.includes(x.role)&&typeof x.body==="string"):[]}
