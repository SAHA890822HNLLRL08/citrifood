import {normalizeRoute} from "./routing.js";
export async function computeGoogleRoute({origin,destination,apiKey,fetchImpl=fetch}={}){
 if(!apiKey)throw new Error("Google Routes API key missing");
 if(!origin||!destination)throw new Error("Route origin and destination are required");
 const body={origin:{location:{latLng:{latitude:Number(origin.lat),longitude:Number(origin.lng)}}},destination:{location:{latLng:{latitude:Number(destination.lat),longitude:Number(destination.lng)}}},travelMode:"TWO_WHEELER",routingPreference:"TRAFFIC_AWARE"};
 const response=await fetchImpl("https://routes.googleapis.com/directions/v2:computeRoutes",{method:"POST",headers:{"Content-Type":"application/json","X-Goog-Api-Key":apiKey,"X-Goog-FieldMask":"routes.distanceMeters,routes.duration"},body:JSON.stringify(body)});
 if(!response.ok)throw new Error("Google Routes request failed: "+response.status);
 const data=await response.json();const route=data?.routes?.[0];
 if(!route)throw new Error("Google Routes returned no route");
 const seconds=Number(String(route.duration||"0s").replace("s",""));
 return normalizeRoute({distanceMeters:route.distanceMeters,durationSeconds:seconds,provider:"google-routes"});
}
