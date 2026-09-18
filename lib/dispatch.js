// Motor inicial de asignación CitriFood.
// Los pesos son configurables: después se calibrarán con datos reales.
export const DEFAULT_WEIGHTS={distance:.38,onTime:.20,completion:.14,cancel:.12,rating:.10,incidents:.06};
const clamp=n=>Math.max(0,Math.min(1,n));
export function courierScore(c,w=DEFAULT_WEIGHTS){
 const distance=clamp(1-(c.distanceKm/6));
 const onTime=clamp(c.onTimeRate);
 const completion=clamp(c.completionRate);
 const noCancel=clamp(1-c.cancelRate);
 const rating=clamp((c.rating||0)/5);
 const cleanRecord=clamp(1-(c.validIncidents||0)*.12);
 return 100*(distance*w.distance+onTime*w.onTime+completion*w.completion+noCancel*w.cancel+rating*w.rating+cleanRecord*w.incidents);
}
export function rankCouriers(couriers,weights){
 return couriers.filter(c=>c.online&&c.available&&c.documentsApproved&&!c.suspended)
  .map(c=>({...c,dispatchScore:+courierScore(c,weights).toFixed(1)}))
  .sort((a,b)=>b.dispatchScore-a.dispatchScore||a.distanceKm-b.distanceKm);
}
export function dispatchDecision(couriers,weights){
 const ranked=rankCouriers(couriers,weights);
 return {selected:ranked[0]||null,alternates:ranked.slice(1),createdAt:new Date().toISOString()};
}