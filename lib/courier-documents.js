export const REQUIRED_COURIER_DOCUMENTS=["identity","license","vehicle"];
export function documentIsCurrent(document,{now=new Date()}={}){
 if(!document||document.verified!==true)return false;
 if(!document.expiresAt)return true;
 const expires=new Date(document.expiresAt);
 if(Number.isNaN(expires.getTime()))return false;
 return expires.getTime()>=now.getTime();
}
export function courierDocumentsStatus(documents={},options={}){
 const detail=Object.fromEntries(REQUIRED_COURIER_DOCUMENTS.map(key=>[key,documentIsCurrent(documents[key],options)]));
 const missing=REQUIRED_COURIER_DOCUMENTS.filter(key=>!detail[key]);
 return {valid:missing.length===0,detail,missing};
}

export function documentExpiryState(document,{now=new Date(),warningDays=30}={}){
 if(!document||document.verified!==true)return {state:"pending",daysLeft:null};
 if(!document.expiresAt)return {state:"current",daysLeft:null};
 const expires=new Date(document.expiresAt);if(Number.isNaN(expires.getTime()))return {state:"invalid",daysLeft:null};
 const daysLeft=Math.ceil((expires.getTime()-now.getTime())/86400000);
 if(daysLeft<0)return {state:"expired",daysLeft};
 if(daysLeft<=warningDays)return {state:"expiring",daysLeft};
 return {state:"current",daysLeft};
}
export function courierDocumentAlerts(documents={},options={}){
 return REQUIRED_COURIER_DOCUMENTS.map(key=>({key,...documentExpiryState(documents[key],options)})).filter(x=>x.state!=="current");
}
