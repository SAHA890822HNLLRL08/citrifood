// Demo metrics: never mix illustrative cards with actual browser-created orders.
export const TERMINAL_STATUSES=new Set(["Entregado","Rechazado","Cancelado"]);
export function orderMetrics(orders=[],options={}){
 const {from="",to="",restaurant=""}=options;
 const actual=orders.filter(o=>o&&typeof o.id==="string"&&!o.id.startsWith("CF-DEMO-")&&(!restaurant||o.restaurant===restaurant)&&(!from||typeof o.createdAt==="string"&&o.createdAt.slice(0,10)>=from)&&(!to||typeof o.createdAt==="string"&&o.createdAt.slice(0,10)<=to));
 const byRestaurant={};
 for(const o of actual){
  const name=o.restaurant||"Sin restaurante";
  const group=byRestaurant[name]||(byRestaurant[name]={restaurant:name,total:0,delivered:0,cancelled:0,rejected:0,active:0,deliveredTotalCents:0});
  group.total++;
  if(o.status==="Entregado"){group.delivered++;const value=Number(o.total);if(Number.isFinite(value)&&value>=0)group.deliveredTotalCents+=Math.round(value*100)}
  else if(o.status==="Cancelado")group.cancelled++;
  else if(o.status==="Rechazado")group.rejected++;
  else group.active++;
 }
 const restaurants=Object.values(byRestaurant).sort((a,b)=>a.restaurant.localeCompare(b.restaurant,"es"));
 return {total:actual.length,delivered:restaurants.reduce((n,g)=>n+g.delivered,0),cancelled:restaurants.reduce((n,g)=>n+g.cancelled,0),rejected:restaurants.reduce((n,g)=>n+g.rejected,0),active:restaurants.reduce((n,g)=>n+g.active,0),deliveredTotalCents:restaurants.reduce((n,g)=>n+g.deliveredTotalCents,0),restaurants};
}
