const KEY="citrifood_couriers_v1";
export const DEFAULT_COURIERS=[
{id:"CF-R001",name:"Juan Pérez",phone:"826 000 1122",vehicle:"Moto",zone:"Centro",online:true,available:true,endingShift:true,status:"Terminando jornada",activeOrders:2,documentsApproved:true,suspended:false,onTimeRate:.79,completionRate:.91,cancelRate:.12,rating:4.2,validIncidents:2,autoAccept:false,offers:25,unansweredOffers:2},
{id:"CF-R002",name:"Pedro García",phone:"826 000 2233",vehicle:"Auto",zone:"Centro",online:true,available:true,endingShift:false,status:"Disponible",activeOrders:0,documentsApproved:true,suspended:false,onTimeRate:.97,completionRate:.99,cancelRate:.01,rating:4.9,validIncidents:0,autoAccept:true,offers:40,unansweredOffers:1},
{id:"CF-R003",name:"Luis Torres",phone:"826 000 3344",vehicle:"Moto",zone:"Morelos",online:true,available:true,endingShift:false,status:"Disponible",activeOrders:0,documentsApproved:true,suspended:false,onTimeRate:.94,completionRate:.97,cancelRate:.03,rating:4.8,validIncidents:0,autoAccept:false,offers:31,unansweredOffers:1},
{id:"CF-R004",name:"Carlos Ruiz",phone:"826 000 4455",vehicle:"Moto",zone:"Centro",online:false,available:true,endingShift:false,status:"Desconectado",activeOrders:0,documentsApproved:true,suspended:false,onTimeRate:.98,completionRate:.99,cancelRate:0,rating:5,validIncidents:0,autoAccept:false,offers:12,unansweredOffers:0}
];
const normalize=c=>({...c,online:c.online===true,available:c.available!==false,endingShift:c.endingShift===true,documentsApproved:c.documentsApproved===true,suspended:c.suspended===true,activeOrders:Math.max(0,Number(c.activeOrders)||0),rating:Number(c.rating)||0});
export function loadCouriers(){if(typeof window==="undefined")return DEFAULT_COURIERS.map(normalize);try{const raw=JSON.parse(localStorage.getItem(KEY)||"null");if(Array.isArray(raw)&&raw.length)return raw.map(normalize);localStorage.setItem(KEY,JSON.stringify(DEFAULT_COURIERS));return DEFAULT_COURIERS.map(normalize)}catch{return DEFAULT_COURIERS.map(normalize)}}
export function saveCouriers(couriers){if(typeof window!=="undefined"){localStorage.setItem(KEY,JSON.stringify(couriers.map(normalize)));window.dispatchEvent(new Event("citrifood:couriers"))}return couriers}
export function updateCourier(id,changes){const all=loadCouriers();let updated=null;const next=all.map(c=>{if(c.id!==id)return c;updated=normalize({...c,...changes,id:c.id});return updated});if(updated)saveCouriers(next);return updated}
export function addCourier(data){const all=loadCouriers();const id=data.id||"CF-R"+String(all.length+1).padStart(3,"0");if(all.some(c=>c.id===id))throw new Error("courier_exists");const courier=normalize({onTimeRate:1,completionRate:1,cancelRate:0,rating:5,validIncidents:0,offers:0,unansweredOffers:0,autoAccept:false,online:false,available:true,endingShift:false,documentsApproved:false,suspended:false,status:"Desconectado",activeOrders:0,...data,id});saveCouriers([...all,courier]);return courier}
export function subscribeCouriers(fn){if(typeof window==="undefined")return()=>{};window.addEventListener("citrifood:couriers",fn);window.addEventListener("storage",fn);return()=>{window.removeEventListener("citrifood:couriers",fn);window.removeEventListener("storage",fn)}}

export function suspendCourier(id,{reason="Suspensión operativa",actor="Operaciones"}={}){
 const courier=loadCouriers().find(c=>c.id===id);if(!courier)return null;const at=new Date().toISOString();
 const event={type:"suspended",reason,actor,at};
 return updateCourier(id,{suspended:true,online:false,available:false,endingShift:false,status:"Suspendido",suspensionReason:reason,suspendedAt:at,audit:[...(courier.audit||[]),event]});
}
export function reactivateCourier(id,{actor="Operaciones"}={}){
 const courier=loadCouriers().find(c=>c.id===id);if(!courier)return null;const at=new Date().toISOString();
 const event={type:"reactivated",actor,at};
 return updateCourier(id,{suspended:false,online:false,available:true,endingShift:false,status:"Desconectado",suspensionReason:null,reactivatedAt:at,audit:[...(courier.audit||[]),event]});
}
