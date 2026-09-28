// Provider-independent routing contract for CitriFood.
// Production adapters can use Google Routes first and be replaced without changing finance/order logic.
export const ROUTING_PROVIDER="google-routes";
export function normalizeRoute({distanceMeters,durationSeconds,provider=ROUTING_PROVIDER}={}){
 const meters=Math.max(0,Number(distanceMeters)||0);
 const seconds=Math.max(0,Number(durationSeconds)||0);
 return {provider,distanceMeters:Math.round(meters),distanceKm:Math.round(meters/10)/100,durationSeconds:Math.round(seconds),durationMinutes:Math.ceil(seconds/60)};
}
export function routePricingDistance(route){
 const km=Number(route?.distanceKm);
 return Number.isFinite(km)&&km>=0?km:null;
}
