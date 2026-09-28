// CitriFood progressive onboarding rules.
// Keep the first registration short; additional verification can happen after activation.
export const ONBOARDING_REQUIREMENTS={
 customer:[
  {id:"phone",label:"Teléfono",type:"phone",required:true},
  {id:"profile_selfie",label:"Selfie de perfil",type:"live_selfie",required:true,humanFace:true},
  {id:"terms",label:"Términos de uso",type:"consent",required:true},
  {id:"privacy",label:"Aviso de privacidad",type:"consent",required:true}
 ],
 restaurant:[
  {id:"restaurant_name",label:"Nombre del restaurante",type:"text",required:true,phase:"quick_start"},
  {id:"responsible_name",label:"Dueño o encargado",type:"text",required:true,phase:"quick_start"},
  {id:"phone",label:"Teléfono",type:"phone",required:true,phase:"quick_start"},
  {id:"payout_account",label:"Cuenta bancaria para depósitos",type:"bank_token",required:true,phase:"quick_start"},
  {id:"address",label:"Dirección escrita",type:"address",required:true,phase:"quick_start"},
  {id:"gps_location",label:"Ubicación GPS confirmada",type:"geo",required:true,phase:"quick_start"},
  {id:"tax_profile",label:"Datos fiscales",type:"tax",required:false,phase:"complete_business"},
  {id:"facade",label:"Foto de fachada",type:"image",required:false,phase:"complete_business"},
  {id:"commercial_terms",label:"Términos comerciales",type:"consent",required:true},
  {id:"privacy",label:"Aviso de privacidad",type:"consent",required:true}
 ],
 courier:[
  {id:"ine",label:"INE vigente",type:"document",expiry:true,required:true},
  {id:"profile_selfie",label:"Selfie / prueba de vida",type:"live_selfie",faceMatchWith:"ine",required:true},
  {id:"license",label:"Licencia de conducir vigente",type:"document",expiry:true,required:true},
  {id:"vehicle_registration",label:"Tarjeta de circulación vigente",type:"document",expiry:true,required:true},
  {id:"vehicle_insurance",label:"Seguro vigente de moto o auto",type:"document",expiry:true,required:true},
  {id:"vehicle_photo",label:"Foto del vehículo",type:"image",required:true},
  {id:"legal_terms",label:"Términos de plataforma",type:"consent",required:true},
  {id:"privacy",label:"Aviso de privacidad",type:"consent",required:true}
 ]
};
export function requirementsFor(role){return ONBOARDING_REQUIREMENTS[role]||[]}
export function quickStartRequirements(role){return requirementsFor(role).filter(x=>x.required&&(role!=="restaurant"||x.phase==="quick_start"||x.type==="consent"))}
export function isExpired(date,now=new Date()){if(!date)return true;const d=new Date(date+"T23:59:59");return Number.isNaN(d.getTime())||d<now}
export function validateOnboarding(role,records={},quickStart=false){const reqs=quickStart?quickStartRequirements(role):requirementsFor(role).filter(x=>x.required);const missing=[];const expired=[];for(const req of reqs){const item=records[req.id];if(!item?.completed)missing.push(req.id);if(req.expiry&&item?.completed&&isExpired(item.expiresAt))expired.push(req.id)}return {ok:missing.length===0&&expired.length===0,missing,expired}}
export function consentReceipt({userId,role,documentId,version}){return {userId,role,documentId,version,acceptedAt:new Date().toISOString(),method:"electronic_acceptance"}}
