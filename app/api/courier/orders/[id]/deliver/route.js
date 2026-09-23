import {authenticatedSupabase} from "../../../../../../lib/shared-orders.js";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function POST(request,{params}){
 const orderId=(await params).id;
 if(!uuid.test(orderId))return Response.json({error:"Pedido inválido."},{status:400,headers});
 const authorization=request.headers.get("authorization")||"";
 const token=/^Bearer [^\s]+$/i.test(authorization)?authorization.slice(7):"";
 const auth=await authenticatedSupabase(token);
 if(!auth)return Response.json({error:"Inicia sesión para confirmar la entrega."},{status:401,headers});
 try{
  const response=await fetch(auth.config.url+"/rest/v1/rpc/cf_courier_complete_order",{
   method:"POST",
   headers:{apikey:auth.config.anon,Authorization:"Bearer "+token,"Content-Type":"application/json",Accept:"application/json"},
   body:JSON.stringify({p_order_id:orderId}),signal:AbortSignal.timeout(7000),cache:"no-store",redirect:"error"
  });
  if(!response.ok)return Response.json({error:"No se pudo confirmar. Revisa que el pedido esté asignado a tu cuenta y en entrega."},{status:response.status===401||response.status===403?403:409,headers});
  const data=await response.json();
  if(!Array.isArray(data)||data.length!==1)return Response.json({error:"Respuesta inesperada del servidor."},{status:503,headers});
  return Response.json({order:data[0]},{headers});
 }catch{return Response.json({error:"El servidor no está disponible."},{status:503,headers})}
}
