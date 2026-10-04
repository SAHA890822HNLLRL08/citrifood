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
