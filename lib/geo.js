// CitriFood geographic helpers. Straight-line distance is for pilot estimates only;
// production delivery pricing should use a routing provider's road distance.
const EARTH_RADIUS_KM=6371;
const rad=n=>Number(n)*Math.PI/180;
export function haversineKm(a,b){
 if(!a||!b)return null;const [lat1,lon1,lat2,lon2]=[a.lat,a.lng,b.lat,b.lng].map(Number);
 if(![lat1,lon1,lat2,lon2].every(Number.isFinite))return null;
 const dLat=rad(lat2-lat1),dLon=rad(lon2-lon1);
 const h=Math.sin(dLat/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
 return Math.round((2*EARTH_RADIUS_KM*Math.asin(Math.sqrt(h)))*100)/100;
}
export function usablePosition(position,maxAccuracyM=100){
 const c=position?.coords;if(!c)return null;
 const accuracy=Number(c.accuracy);if(!Number.isFinite(accuracy)||accuracy>maxAccuracyM)return null;
 return {lat:Number(c.latitude),lng:Number(c.longitude),accuracyM:accuracy};
}
