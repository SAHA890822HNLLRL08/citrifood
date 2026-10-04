import {getSupabaseBrowserClient} from "./supabase-client.js";
export async function fetchOperationsSharedOrders(){
 const supabase=getSupabaseBrowserClient();if(!supabase)return {ok:false,orders:[],error:"Supabase no está configurado."};
 const {data:sessionData}=await supabase.auth.getSession();if(!sessionData?.session)return {ok:false,orders:[],error:"Inicia sesión con una cuenta de Operaciones."};
 const {data,error}=await supabase.rpc("cf_operations_orders");
 return error?{ok:false,orders:[],error:error.message}:{ok:true,orders:Array.isArray(data)?data:[]};
}
