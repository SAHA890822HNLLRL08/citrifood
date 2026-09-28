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
