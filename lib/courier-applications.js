const KEY="citrifood_courier_applications_v1";
export const DEFAULT_APPLICATIONS=[
{id:"SOL-31",name:"Miguel Hernández",phone:"826 111 2233",vehicle:"Moto",status:"Pendiente",documents:{identity:true,license:true,vehicle:true}},
{id:"SOL-32",name:"Daniel Garza",phone:"826 222 3344",vehicle:"Auto",status:"Pendiente",documents:{identity:true,license:false,vehicle:true}}
];
export function loadApplications(){if(typeof window==="undefined")return DEFAULT_APPLICATIONS;try{const rows=JSON.parse(localStorage.getItem(KEY)||"null");if(Array.isArray(rows))return rows;localStorage.setItem(KEY,JSON.stringify(DEFAULT_APPLICATIONS));return DEFAULT_APPLICATIONS}catch{return DEFAULT_APPLICATIONS}}
export function saveApplications(rows){if(typeof window!=="undefined"){localStorage.setItem(KEY,JSON.stringify(rows));window.dispatchEvent(new Event("citrifood:applications"))}return rows}
export function updateApplication(id,changes){const rows=loadApplications();let updated=null;const next=rows.map(x=>{if(x.id!==id)return x;updated={...x,...changes,id:x.id,updatedAt:new Date().toISOString()};return updated});if(updated)saveApplications(next);return updated}
export function documentsComplete(row){const d=row?.documents||{};return d.identity===true&&d.license===true&&d.vehicle===true}
export function subscribeApplications(fn){if(typeof window==="undefined")return()=>{};window.addEventListener("citrifood:applications",fn);window.addEventListener("storage",fn);return()=>{window.removeEventListener("citrifood:applications",fn);window.removeEventListener("storage",fn)}}
