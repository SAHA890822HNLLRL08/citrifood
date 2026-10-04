import {getSupabaseBrowserClient} from "./supabase-client.js";

async function accessToken(){
 const supabase=getSupabaseBrowserClient();if(!supabase)return null;
 const {data,error}=await supabase.auth.getSession();if(error)return null;
 return data?.session?.access_token||null;
}
export async function createSharedCustomerOrder(order){
 const token=await accessToken();if(!token)return {shared:false,reason:"no_session"};
 try{
  const response=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({
   restaurant:order.restaurant,address:order.address,deliveryNotes:order.deliveryNotes||"",items:order.items,deliveryFee:order.deliveryFee,protectionFee:order.protectionFee,total:order.total,paymentMethod:order.paymentMethod,customerCoordinates:order.customerCoordinates
  })});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)return {shared:false,reason:"server",error:body.error||"No se pudo guardar el pedido compartido."};
  return {shared:true,order:body.orders?.[0]||null};
 }catch{return {shared:false,reason:"network",error:"No se pudo conectar con pedidos compartidos."}}
}
export async function fetchSharedCustomerOrders(){
 const token=await accessToken();if(!token)return {shared:false,orders:[]};
 try{
  const response=await fetch("/api/orders",{headers:{Authorization:"Bearer "+token},cache:"no-store"});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)return {shared:false,orders:[],error:body.error};
  return {shared:true,orders:body.orders||[]};
 }catch{return {shared:false,orders:[],error:"No se pudo consultar pedidos compartidos."}}
}

export async function cancelSharedCustomerOrder(orderId){
 const supabase=getSupabaseBrowserClient();if(!supabase)return {ok:false,error:"Supabase no está configurado."};
 const {data}=await supabase.auth.getSession();if(!data?.session)return {ok:false,error:"Inicia sesión para cancelar el pedido compartido."};
 const {error}=await supabase.rpc("cf_customer_cancel_order",{p_order_id:orderId});
 return error?{ok:false,error:error.message}:{ok:true};
}
