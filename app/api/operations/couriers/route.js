import {authenticatedSupabase} from "../../../../lib/shared-orders.js";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
export async function GET(request){
 const authorization=request.headers.get("authorization")||"";
 const token=/^Bearer [^\s]+$/i.test(authorization)?authorization.slice(7):"";
 const auth=await authenticatedSupabase(token);
 if(!auth)return Response.json({error:"Inicia sesión para consultar repartidores."},{status:401,headers});
 const {config,userId}=auth;
 const options={headers:{apikey:config.anon,Authorization:"Bearer "+token,Accept:"application/json"},signal:AbortSignal.timeout(7000),cache:"no-store",redirect:"error"};
 try{
  const permission=await fetch(config.url+"/rest/v1/cf_operations_members?select=user_id&user_id=eq."+userId,options);
  if(!permission.ok)return Response.json({error:"No se pudo verificar el permiso."},{status:503,headers});
  const membership=await permission.json();
  if(!Array.isArray(membership)||!membership.some(x=>x.user_id===userId))return Response.json({error:"Cuenta no autorizada."},{status:403,headers});
  const response=await fetch(config.url+"/rest/v1/cf_courier_members?select=user_id,display_name&active=eq.true&order=display_name.asc&limit=100",options);
  if(!response.ok)return Response.json({error:"No se pudieron consultar los repartidores."},{status:503,headers});
  const couriers=await response.json();
  return Response.json({couriers:Array.isArray(couriers)?couriers:[]},{headers});
 }catch{return Response.json({error:"El servidor no está disponible."},{status:503,headers})}
}
