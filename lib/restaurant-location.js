const STORAGE_KEY="citrifood_restaurant_locations_v1";
const safeRead=()=>{if(typeof window==="undefined")return {};try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")||{}}catch{return {}}};
export function loadRestaurantLocation(name){return safeRead()[name]||null}
export function saveRestaurantLocation(name,point,{accuracyM=null,verifiedAt=new Date().toISOString()}={}){
 if(typeof window==="undefined"||!name||!point)return null;
 const lat=Number(point.lat),lng=Number(point.lng);if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;
 const all=safeRead();const record={lat,lng,accuracyM:Number.isFinite(Number(accuracyM))?Number(accuracyM):null,verifiedAt};all[name]=record;localStorage.setItem(STORAGE_KEY,JSON.stringify(all));return record;
}
export function restaurantLocationReady(record,maxAgeDays=30){
 if(!record||!Number.isFinite(Number(record.lat))||!Number.isFinite(Number(record.lng))||!record.verifiedAt)return false;
 const age=Date.now()-new Date(record.verifiedAt).getTime();return Number.isFinite(age)&&age>=0&&age<=maxAgeDays*86400000;
}
