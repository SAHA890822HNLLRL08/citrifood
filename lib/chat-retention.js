export const CHAT_RETENTION_DAYS=15;
export const CHAT_RETENTION_MS=CHAT_RETENTION_DAYS*24*60*60*1000;
// A message expires exactly 15 days after it was sent (UTC timestamp).
export function retainedMessages(messages,now=Date.now()){
 if(!Array.isArray(messages))return [];
 return messages.filter(m=>{const sent=Date.parse(m?.at);return Number.isFinite(sent)&&sent<=now&&now-sent<CHAT_RETENTION_MS});
}
export function pruneOrderChats(state,now=Date.now()){
 if(!state||!Array.isArray(state.orders))return {state,changed:false};
 let changed=false;
 const orders=state.orders.map(o=>{
  if(!Array.isArray(o.messages))return o;
  const messages=retainedMessages(o.messages,now);
  if(messages.length===o.messages.length)return o;
  changed=true;
  return {...o,messages};
 });
 return {state:changed?{...state,orders}:state,changed};
}
