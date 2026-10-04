import {getSupabaseBrowserClient} from "./supabase-client.js";
export async function fetchRestaurantSharedOrders(){
 const supabase=getSupabaseBrowserClient();if(!supabase)return {shared:false,orders:[],restaurants:[],reason:"not_configured"};
 const {data}=await supabase.auth.getSession();const token=data?.session?.access_token;if(!token)return {shared:false,orders:[],restaurants:[],reason:"no_session"};
 try{
  const response=await fetch("/api/restaurant/orders",{headers:{Authorization:"Bearer "+token},cache:"no-store"});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)return {shared:false,orders:[],restaurants:[],error:body.error||"No se pudieron consultar pedidos compartidos."};
  return {shared:true,orders:body.orders||[],restaurants:body.restaurants||[],message:body.message||""};
 }catch{return {shared:false,orders:[],restaurants:[],error:"No se pudo conectar con pedidos compartidos."}}
}

export async function advanceRestaurantSharedOrder(orderId,nextStatus){
 const supabase=getSupabaseBrowserClient();if(!supabase)return {ok:false,error:"Supabase no está configurado."};
 const {data}=await supabase.auth.getSession();if(!data?.session)return {ok:false,error:"Inicia sesión como restaurante."};
 const {error}=await supabase.rpc("cf_restaurant_advance_order",{p_order_id:orderId,p_next_status:nextStatus});
 return error?{ok:false,error:error.message}:{ok:true};
}
