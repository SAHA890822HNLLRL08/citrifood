export async function requestDeliveryRoute({origin,destination,fetchImpl=fetch}={}){
 if(!origin||!destination)throw new Error("Origin and destination are required");
 const response=await fetchImpl("/api/route",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({origin,destination})});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.error||"No fue posible calcular la ruta");
 return data;
}
export function routeQuoteState(route){
 const km=Number(route?.distanceKm);
 if(!Number.isFinite(km)||km<0)return {ready:false,distanceKm:null,durationMinutes:null};
 return {ready:true,distanceKm:km,durationMinutes:Number(route.durationMinutes)||null};
}
