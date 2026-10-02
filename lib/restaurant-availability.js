const STORAGE_KEY="citrifood_restaurant_availability_v1";
const DEFAULT_SCHEDULE={enabled:false,open:"09:00",close:"23:00",days:[0,1,2,3,4,5,6]};
const read=()=>{if(typeof window==="undefined")return {};try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")||{}}catch{return {}}};
const validTime=value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(String(value||""));
export function normalizeRestaurantSchedule(value={}){
 const days=Array.isArray(value.days)?[...new Set(value.days.map(Number).filter(day=>Number.isInteger(day)&&day>=0&&day<=6))]:DEFAULT_SCHEDULE.days;
 const hasDays=Array.isArray(value.days);return {enabled:value.enabled===true,open:validTime(value.open)?value.open:DEFAULT_SCHEDULE.open,close:validTime(value.close)?value.close:DEFAULT_SCHEDULE.close,days:hasDays?days:DEFAULT_SCHEDULE.days};
}
export function isWithinRestaurantSchedule(schedule,date=new Date()){
 const s=normalizeRestaurantSchedule(schedule);if(!s.enabled)return true;
 const day=Number.isInteger(date?.weekday)?date.weekday:date.getDay();const hour=Number.isInteger(date?.hour)?date.hour:date.getHours();const minute=Number.isInteger(date?.minute)?date.minute:date.getMinutes();const minutes=hour*60+minute;const [oh,om]=s.open.split(":").map(Number);const [ch,cm]=s.close.split(":").map(Number);const start=oh*60+om;const end=ch*60+cm;
 if(start===end)return s.days.includes(day);
 if(start<end)return s.days.includes(day)&&minutes>=start&&minutes<end;
 if(minutes>=start)return s.days.includes(day);
 const previousDay=(day+6)%7;
 return minutes<end&&s.days.includes(previousDay);
}
export function getRestaurantAvailability(name,date=new Date()){
 const value=read()[name]||{};const manualAcceptingOrders=typeof value.manualAcceptingOrders==="boolean"?value.manualAcceptingOrders:(typeof value.acceptingOrders==="boolean"?value.acceptingOrders:true);const schedule=normalizeRestaurantSchedule(value.schedule);const scheduleOpen=isWithinRestaurantSchedule(schedule,date);
 return {...value,manualAcceptingOrders,schedule,scheduleOpen,acceptingOrders:manualAcceptingOrders&&scheduleOpen,updatedAt:value.updatedAt||null};
}
export function setRestaurantAcceptingOrders(name,acceptingOrders){
 if(typeof window==="undefined"||!name)return null;
 const all=read();const previous=all[name]||{};const record={...previous,manualAcceptingOrders:Boolean(acceptingOrders),acceptingOrders:Boolean(acceptingOrders),schedule:normalizeRestaurantSchedule(previous.schedule),updatedAt:new Date().toISOString()};
 all[name]=record;localStorage.setItem(STORAGE_KEY,JSON.stringify(all));window.dispatchEvent(new Event("citrifood:restaurant-availability"));return record;
}
export function setRestaurantSchedule(name,schedule){
 if(typeof window==="undefined"||!name)return null;
 const all=read();const previous=all[name]||{};const record={...previous,schedule:normalizeRestaurantSchedule(schedule),updatedAt:new Date().toISOString()};
 all[name]=record;localStorage.setItem(STORAGE_KEY,JSON.stringify(all));window.dispatchEvent(new Event("citrifood:restaurant-availability"));return record;
}
export function subscribeRestaurantAvailability(fn){
 if(typeof window==="undefined")return()=>{};
 window.addEventListener("citrifood:restaurant-availability",fn);window.addEventListener("storage",fn);
 return()=>{window.removeEventListener("citrifood:restaurant-availability",fn);window.removeEventListener("storage",fn)};
}
