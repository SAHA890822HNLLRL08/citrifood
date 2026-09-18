// Dynamic stop planner for CitriFood multi-order routes.
export function buildStops(orders=[]){
 const stops=[];
 for(const o of orders){
  stops.push({id:o.id+"-P",orderId:o.id,type:"pickup",name:o.restaurant,zone:o.pickup,priority:o.pickupEta||99});
  stops.push({id:o.id+"-D",orderId:o.id,type:"dropoff",name:o.customer||"Cliente",zone:o.destination,priority:o.deliveryEta||999});
 }
 const picked=new Set();
 const result=[];
 while(result.length<stops.length){
  const candidates=stops.filter(s=>!result.some(r=>r.id===s.id)&&(s.type==="pickup"||picked.has(s.orderId)));
  candidates.sort((a,b)=>a.priority-b.priority);
  const next=candidates[0]; if(!next)break;
  result.push(next); if(next.type==="pickup")picked.add(next.orderId);
 }
 return result;
}
export function routeSummary(orders=[]){const stops=buildStops(orders);return {orders:orders.length,stops,atCapacity:orders.length>=4};}
