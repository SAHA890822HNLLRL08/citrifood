export const COMPLAINT_CATEGORIES={
 restaurant_to_courier:["Mala atención","No siguió indicaciones de recolección","Conducta inapropiada","Problema con el pedido","Otro"],
 courier_to_restaurant:["Demora excesiva","Mala atención","Pedido en mal estado","Pedido incompleto o mal empacado","Restaurante cerrado","Otro"]
};
export const EVIDENCE_REQUIRED=new Set(["Pedido en mal estado"]);
export function complaintCategories(reporterRole){return COMPLAINT_CATEGORIES[reporterRole]||[]}
export function validateComplaint({reporterRole,category,description,evidence=[]}){
 const categories=complaintCategories(reporterRole);
 if(!categories.includes(category))return {ok:false,error:"Selecciona un motivo válido."};
 const detail=String(description||"").trim();
 if(detail.length<5||detail.length>600)return {ok:false,error:"Describe lo ocurrido entre 5 y 600 caracteres."};
 if(EVIDENCE_REQUIRED.has(category)&&!evidence.length)return {ok:false,error:"Este reporte requiere foto o video como evidencia."};
 return {ok:true};
}
export function buildComplaint({orderId,reporterRole,category,description,evidence=[]}){
 const check=validateComplaint({reporterRole,category,description,evidence});
 if(!check.ok)return check;
 return {ok:true,complaint:{id:"CQ-"+Date.now().toString(36).toUpperCase(),orderId,reporterRole,category,description:String(description).trim(),evidence:evidence.map(x=>({name:x.name,type:x.type,size:x.size})),status:"Pendiente de revisión",createdAt:new Date().toISOString()}};
}
