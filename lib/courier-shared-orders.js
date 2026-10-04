import {getSupabaseBrowserClient} from "./supabase-client.js";
export async function fetchCourierSharedOrders(){
 const supabase=getSupabaseBrowserClient();if(!supabase)return {shared:false,orders:[],reason:"not_configured"};
 const {data}=await supabase.auth.getSession();const token=data?.session?.access_token;if(!token)return {shared:false,orders:[],reason:"no_session"};
 try{
  const response=await fetch("/api/courier/orders",{headers:{Authorization:"Bearer "+token},cache:"no-store"});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)return {shared:false,orders:[],error:body.error||"No se pudieron consultar tus entregas."};
  return {shared:true,courier:body.courier||null,orders:body.orders||[],message:body.message||""};
 }catch{return {shared:false,orders:[],error:"No se pudo conectar con tus entregas compartidas."}}
}

export async function arriveSharedCustomer(orderId,position){
 const supabase=getSupabaseBrowserClient();if(!supabase)return {ok:false,error:"Supabase no está configurado."};
 const {data}=await supabase.auth.getSession();if(!data?.session)return {ok:false,error:"Inicia sesión como repartidor."};
 const {error}=await supabase.rpc("cf_courier_arrive_customer",{p_order_id:orderId,p_lat:position.lat,p_lng:position.lng,p_accuracy_m:position.accuracy});
 return error?{ok:false,error:error.message}:{ok:true};
}
export async function completeSharedOrder(orderId,pin){
 const supabase=getSupabaseBrowserClient();if(!supabase)return {ok:false,error:"Supabase no está configurado."};
 const {data}=await supabase.auth.getSession();if(!data?.session)return {ok:false,error:"Inicia sesión como repartidor."};
 const {error}=await supabase.rpc("cf_courier_complete_order",{p_order_id:orderId,p_pin:String(pin||"").replace(/\D/g,"").slice(0,4)});
 return error?{ok:false,error:error.message}:{ok:true};
}
