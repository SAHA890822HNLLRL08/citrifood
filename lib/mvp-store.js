const KEY="citrifood_mvp";
export function loadMvp(){if(typeof window==="undefined")return null;try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch{return null}}
export function saveMvp(value){if(typeof window!=="undefined")localStorage.setItem(KEY,JSON.stringify(value));return value}
export function clearMvp(){if(typeof window!=="undefined")localStorage.removeItem(KEY)}
export function createOrder(data){return {id:"CF-"+Date.now().toString().slice(-6),status:"received",createdAt:new Date().toISOString(),...data}}