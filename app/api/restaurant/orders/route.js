import {authenticatedSupabase} from "../../../../lib/shared-orders.js";
export const dynamic="force-dynamic";
const noStore={"Cache-Control":"no-store"};
function respond(body,status=200){return Response.json(body,{status,headers:noStore})}
export async function GET(request){
 const header=request.headers.get("authorization")||"";
 const token=/^Bearer [^\s]+$/i.test(header)?header.slice(7):"";
 const auth=await authenticatedSupabase(token);
 if(!auth)return respond({error:"Inicia sesión para consultar los pedidos del restaurante."},401);
 const {config}=auth;
 const headers={apikey:config.anon,Authorization:"Bearer "+token,Accept:"application/json"};
 const options={headers,signal:AbortSignal.timeout(7000),cache:"no-store",redirect:"error"};
 try{
  const members=await fetch(config.url+"/rest/v1/cf_restaurant_members?select=restaurant_name&user_id=eq."+auth.userId,options);
  if(!members.ok)return respond({error:"No se pudo comprobar el acceso al restaurante."},503);
  const names=await members.json();
  if(!Array.isArray(names)||names.length===0)return respond({restaurants:[],orders:[],message:"Tu cuenta todavía no está asignada a un restaurante del piloto."});
  const orders=await fetch(config.url+"/rest/v1/cf_orders?select=id,restaurant_name,items,total_cents,status,created_at&order=created_at.desc&limit=100",options);
  if(!orders.ok)return respond({error:"No se pudieron consultar los pedidos del restaurante."},503);
  const data=await orders.json();
  const allowed=new Set(names.map(x=>x.restaurant_name));
  return respond({restaurants:[...allowed],orders:Array.isArray(data)?data.filter(x=>allowed.has(x.restaurant_name)):[]});
 }catch{return respond({error:"El servidor de pedidos no está disponible."},503)}
}
