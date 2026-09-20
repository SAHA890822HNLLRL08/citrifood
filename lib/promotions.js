const KEY="citrifood_demo_promotions_v1";
const defaults={
"Tacos El Centro":[{id:"tacos-2x1",title:"2x1 en tacos de bistec",description:"Llévate dos tacos por el precio de uno.",name:"Promo 2x1 · Tacos de bistec",price:75,emoji:"🌮",active:true}],
"Burger House":[{id:"combo-citri",title:"Combo Citri",description:"Combo especial de Burger House.",name:"Combo Citri",price:129,emoji:"🍔",active:true}],
"Pizza Norte":[],"Sushi Mty":[]
};
export function initialPromotions(){return JSON.parse(JSON.stringify(defaults))}
export function loadPromotions(){if(typeof window==="undefined")return initialPromotions();try{const stored=JSON.parse(localStorage.getItem(KEY)||"null");return stored&&typeof stored==="object"&&!Array.isArray(stored)?{...initialPromotions(),...stored}:initialPromotions()}catch{return initialPromotions()}}
export function promotionsFor(restaurant){return (loadPromotions()[restaurant]||[]).filter(p=>p.active!==false)}
export function savePromotions(data){if(typeof window!=="undefined"){localStorage.setItem(KEY,JSON.stringify(data));window.dispatchEvent(new Event("citrifood:promotions"))}return data}
export function addPromotion(restaurant,input){const title=String(input.title||"").trim(),description=String(input.description||"").trim(),price=Number(input.price);if(!restaurant||!title||!Number.isFinite(price)||price<=0||!Number.isSafeInteger(Math.round(price*100)))throw Error("Promoción inválida");const current=loadPromotions();const promo={id:"PROMO-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,6),title,description,name:title,price:Math.round(price*100)/100,emoji:input.emoji||"🍽️",active:true};savePromotions({...current,[restaurant]:[promo,...(current[restaurant]||[])]});return promo}
export function setPromotionActive(restaurant,id,active){const current=loadPromotions();const entries=current[restaurant]||[];if(!entries.some(p=>p.id===id))return false;savePromotions({...current,[restaurant]:entries.map(p=>p.id===id?{...p,active:!!active}:p)});return true}
export function subscribePromotions(callback){if(typeof window==="undefined")return()=>{};window.addEventListener("storage",callback);window.addEventListener("citrifood:promotions",callback);return()=>{window.removeEventListener("storage",callback);window.removeEventListener("citrifood:promotions",callback)}}
