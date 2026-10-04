import {getSupabaseBrowserClient} from "./supabase-client.js";
export async function fetchOperationsSharedOrders(){
 const supabase=getSupabaseBrowserClient();if(!supabase)return {ok:false,orders:[],error:"Supabase no está configurado."};
 const {data:sessionData}=await supabase.auth.getSession();if(!sessionData?.session)return {ok:false,orders:[],error:"Inicia sesión con una cuenta de Operaciones."};
 const {data,error}=await supabase.rpc("cf_operations_orders");
 return error?{ok:false,orders:[],error:error.message}:{ok:true,orders:Array.isArray(data)?data:[]};
}

export async function assignOperationsSharedCourier(orderId,courierId){
 const supabase=getSupabaseBrowserClient();if(!supabase||!orderId||!courierId)return {ok:false,error:"Pedido o repartidor inválido."};
 const {data:sessionData}=await supabase.auth.getSession();if(!sessionData?.session)return {ok:false,error:"Inicia sesión con una cuenta de Operaciones."};
 const {data,error}=await supabase.rpc("cf_operations_assign_courier",{p_order_id:orderId,p_courier_id:courierId});
 return error?{ok:false,error:error.message}:{ok:true,order:Array.isArray(data)?data[0]:data};
}
