import {authenticatedSupabase} from "../../../../lib/shared-orders.js";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
export async function GET(request){
 const authorization=request.headers.get("authorization")||"";
 const token=/^Bearer [^\s]+$/i.test(authorization)?authorization.slice(7):"";
 const auth=await authenticatedSupabase(token);
 if(!auth)return Response.json({error:"Inicia sesión para consultar tus entregas."},{status:401,headers});
 const {config,userId}=auth;
 const options={headers:{apikey:config.anon,Authorization:"Bearer "+token,Accept:"application/json"},signal:AbortSignal.timeout(7000),cache:"no-store",redirect:"error"};
 try{
  const member=await fetch(config.url+"/rest/v1/cf_courier_members?select=user_id,display_name,active&user_id=eq."+userId,options);
  if(!member.ok)return Response.json({error:"No se pudo verificar tu cuenta de repartidor."},{status:503,headers});
  const roster=await member.json();
  if(!Array.isArray(roster)||!roster.some(x=>x.user_id===userId&&x.active===true))return Response.json({courier:null,orders:[],message:"Esta cuenta no está habilitada como repartidor de prueba."},{headers});
  const response=await fetch(config.url+"/rest/v1/cf_orders?select=id,restaurant_name,items,total_cents,status,created_at&courier_id=eq."+userId+"&order=created_at.desc&limit=50",options);
  if(!response.ok)return Response.json({error:"No se pudieron consultar tus entregas."},{status:503,headers});
  const orders=await response.json();
  return Response.json({courier:roster.find(x=>x.user_id===userId).display_name,orders:Array.isArray(orders)?orders:[]},{headers});
 }catch{return Response.json({error:"El servidor no está disponible."},{status:503,headers})}
}
