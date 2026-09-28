const STORAGE_KEY="citrifood_restaurant_availability_v1";
const read=()=>{if(typeof window==="undefined")return {};try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")||{}}catch{return {}}};
export function getRestaurantAvailability(name){
 const value=read()[name];
 return value&&typeof value.acceptingOrders==="boolean"?value:{acceptingOrders:true,updatedAt:null};
}
export function setRestaurantAcceptingOrders(name,acceptingOrders){
 if(typeof window==="undefined"||!name)return null;
 const all=read();const record={acceptingOrders:Boolean(acceptingOrders),updatedAt:new Date().toISOString()};
 all[name]=record;localStorage.setItem(STORAGE_KEY,JSON.stringify(all));
 window.dispatchEvent(new Event("citrifood:restaurant-availability"));
 return record;
}
export function subscribeRestaurantAvailability(fn){
 if(typeof window==="undefined")return()=>{};
 window.addEventListener("citrifood:restaurant-availability",fn);
 window.addEventListener("storage",fn);
 return()=>{window.removeEventListener("citrifood:restaurant-availability",fn);window.removeEventListener("storage",fn)};
}
