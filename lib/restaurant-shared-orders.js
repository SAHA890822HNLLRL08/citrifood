import {getSupabaseBrowserClient} from "./supabase-client.js";
import {subscribeSharedOrders} from "./shared-order-realtime.js";

const ACTIVE_STATUS_PRIORITY={"Nuevo":0,"Preparando":1,"Listo":2,"Esperando repartidor":3,"En entrega":4,"Entregado":5,"Cancelado":6,"Rechazado":7};

export function restaurantSharedOrderProgress(order={}){
 const ready=Boolean(order.ready_at)||["Listo","Esperando repartidor","En entrega","Entregado"].includes(order.status);
 const courierAssigned=Boolean(order.courier_id);
 const courierArrived=Boolean(order.restaurant_arrival_verified||order.arrived_restaurant_at);
 const pickedUp=Boolean(order.picked_up_at)||["En entrega","Entregado"].includes(order.status);
 return {
  ready,
  courierAssigned,
  courierArrived,
  pickedUp,
  label:pickedUp?"📦 Pedido recogido · en camino al cliente":courierArrived?"📍 Repartidor en el restaurante":courierAssigned?"🛵 Repartidor asignado · en camino al restaurante":ready?"🛵 Buscando repartidor automáticamente…":""
 };
}

export function normalizeRestaurantSharedOrders(orders=[]){
 return [...orders].map(order=>({...order,progress:restaurantSharedOrderProgress(order)})).sort((a,b)=>{
  const statusDelta=(ACTIVE_STATUS_PRIORITY[a.status]??99)-(ACTIVE_STATUS_PRIORITY[b.status]??99);
  if(statusDelta!==0)return statusDelta;
  return new Date(b.created_at||0).getTime()-new Date(a.created_at||0).getTime();
 });
}

export async function fetchRestaurantSharedOrders(){
 const supabase=getSupabaseBrowserClient();if(!supabase)return {shared:false,orders:[],restaurants:[],reason:"not_configured"};
 const {data}=await supabase.auth.getSession();const token=data?.session?.access_token;if(!token)return {shared:false,orders:[],restaurants:[],reason:"no_session"};
 try{
  const response=await fetch("/api/restaurant/orders",{headers:{Authorization:"Bearer "+token},cache:"no-store"});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)return {shared:false,orders:[],restaurants:[],error:body.error||"No se pudieron consultar pedidos compartidos."};
  return {shared:true,orders:normalizeRestaurantSharedOrders(body.orders||[]),restaurants:body.restaurants||[],message:body.message||""};
 }catch{return {shared:false,orders:[],restaurants:[],error:"No se pudo conectar con pedidos compartidos."}}
}

export function subscribeRestaurantSharedOrders(onChange){
 return subscribeSharedOrders({scope:"restaurant",onChange});
}

export async function advanceRestaurantSharedOrder(orderId,nextStatus){
 const supabase=getSupabaseBrowserClient();if(!supabase)return {ok:false,error:"Supabase no está configurado."};
 const {data}=await supabase.auth.getSession();if(!data?.session)return {ok:false,error:"Inicia sesión como restaurante."};
 const {error}=await supabase.rpc("cf_restaurant_advance_order",{p_order_id:orderId,p_next_status:nextStatus});
 return error?{ok:false,error:error.message}:{ok:true};
}

export async function setRestaurantSharedLocation(restaurantName,position){
 const supabase=getSupabaseBrowserClient();if(!supabase)return {ok:false,reason:"not_configured"};
 const {data}=await supabase.auth.getSession();if(!data?.session)return {ok:false,reason:"no_session"};
 const {error}=await supabase.rpc("cf_restaurant_set_location",{p_restaurant_name:restaurantName,p_lat:position.lat,p_lng:position.lng,p_accuracy_m:position.accuracyM??position.accuracy});
 return error?{ok:false,reason:"server",error:error.message}:{ok:true};
}
