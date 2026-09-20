const KEY="citrifood_mvp";
export function loadMvp(){if(typeof window==="undefined")return {orders:[]};try{const data=JSON.parse(localStorage.getItem(KEY)||"null");return data&&Array.isArray(data.orders)?data:{orders:[]}}catch{return {orders:[]}}}
export function saveMvp(value){if(typeof window!=="undefined"){localStorage.setItem(KEY,JSON.stringify(value));window.dispatchEvent(new Event("citrifood:change"))}return value}
export function clearMvp(){if(typeof window!=="undefined"){localStorage.removeItem(KEY);window.dispatchEvent(new Event("citrifood:change"))}}
export function createOrder(data){return {id:"CF-"+Date.now().toString(36).toUpperCase(),status:"Nuevo",createdAt:new Date().toISOString(),...data}}
export function addOrder(data){const order=createOrder(data);const state=loadMvp();saveMvp({...state,orders:[order,...state.orders]});return order}
export function updateOrder(id,changes){const state=loadMvp();const orders=state.orders.map(order=>order.id===id?{...order,...changes,updatedAt:new Date().toISOString()}:order);saveMvp({...state,orders});return orders.find(order=>order.id===id)||null}
export function getOrder(id){return loadMvp().orders.find(order=>order.id===id)||null}
export function subscribeOrders(callback){if(typeof window==="undefined")return()=>{};window.addEventListener("storage",callback);window.addEventListener("citrifood:change",callback);return()=>{window.removeEventListener("storage",callback);window.removeEventListener("citrifood:change",callback)}}
