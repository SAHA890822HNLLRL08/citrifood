import {usablePosition} from "./geo.js";
export function getBrowserPosition({geolocation=globalThis?.navigator?.geolocation,maxAccuracyM=100}={}){
 return new Promise((resolve,reject)=>{
  if(!geolocation)return reject(new Error("Geolocalización no disponible"));
  geolocation.getCurrentPosition(position=>{
   const point=usablePosition(position,maxAccuracyM);
   if(!point)return reject(new Error("Ubicación imprecisa"));
   resolve(point);
  },()=>reject(new Error("No fue posible obtener tu ubicación")),{enableHighAccuracy:true,timeout:10000,maximumAge:30000});
 });
}
export function publicCoordinates(point){
 if(!point)return null;
 const lat=Number(point.lat),lng=Number(point.lng);
 return Number.isFinite(lat)&&Number.isFinite(lng)?{lat,lng}:null;
}
