import {authenticatedSupabase} from "../../../../lib/shared-orders.js";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
export async function GET(request){
 const authorization=request.headers.get("authorization")||"";
 const token=/^Bearer [^\s]+$/i.test(authorization)?authorization.slice(7):"";
 const auth=await authenticatedSupabase(token);
 if(!auth)return Response.json({error:"Inicia sesión para consultar Operaciones."},{status:401,headers});
 const {config,userId}=auth;
 const options={headers:{apikey:config.anon,Authorization:"Bearer "+token,Accept:"application/json"},signal:AbortSignal.timeout(7000),cache:"no-store",redirect:"error"};
 try{
  const permission=await fetch(config.url+"/rest/v1/cf_operations_members?select=user_id&user_id=eq."+userId,options);
  if(!permission.ok)return Response.json({error:"No se pudo verificar el permiso de Operaciones."},{status:503,headers});
  const membership=await permission.json();
  if(!Array.isArray(membership)||!membership.some(x=>x.user_id===userId))return Response.json({error:"Tu cuenta no está autorizada para Operaciones."},{status:403,headers});
  const response=await fetch(config.url+"/rest/v1/cf_orders?select=id,restaurant_name,items,total_cents,status,created_at&order=created_at.desc&limit=100",options);
  if(!response.ok)return Response.json({error:"No se pudieron consultar los pedidos."},{status:503,headers});
  const orders=await response.json();
  return Response.json({orders:Array.isArray(orders)?orders:[]},{headers});
 }catch{return Response.json({error:"El servidor no está disponible."},{status:503,headers})}
}
