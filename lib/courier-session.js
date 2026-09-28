const KEY="citrifood_active_courier_v1";
export function getActiveCourierId(fallback=""){
 if(typeof window==="undefined")return fallback;
 return localStorage.getItem(KEY)||fallback;
}
export function setActiveCourierId(id){
 if(typeof window==="undefined")return id;
 if(id)localStorage.setItem(KEY,id);else localStorage.removeItem(KEY);
 window.dispatchEvent(new Event("citrifood:courier-session"));
 return id;
}
export function subscribeCourierSession(fn){
 if(typeof window==="undefined")return()=>{};
 window.addEventListener("citrifood:courier-session",fn);
 window.addEventListener("storage",fn);
 return()=>{window.removeEventListener("citrifood:courier-session",fn);window.removeEventListener("storage",fn)};
}
