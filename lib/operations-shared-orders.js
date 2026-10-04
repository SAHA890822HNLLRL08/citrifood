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

export async function fetchOperationsPinSecurity(){
 const supabase=getSupabaseBrowserClient();if(!supabase)return {ok:false,items:[],error:"Supabase no está configurado."};
 const {data,error}=await supabase.rpc("cf_operations_pin_security");
 return error?{ok:false,items:[],error:error.message}:{ok:true,items:Array.isArray(data)?data:[]};
}
export async function resetOperationsPinLock(orderId){
 const supabase=getSupabaseBrowserClient();if(!supabase||!orderId)return {ok:false,error:"Pedido inválido."};
 const {data,error}=await supabase.rpc("cf_operations_reset_pin_lock",{p_order_id:orderId});
 return error?{ok:false,error:error.message}:{ok:data===true,error:data===true?"":"No se pudo desbloquear el pedido."};
}

export async function fetchOperationsOrderAudit(orderId){
 const supabase=getSupabaseBrowserClient();if(!supabase||!orderId)return {ok:false,items:[],error:"Pedido inválido."};
 const {data,error}=await supabase.rpc("cf_operations_order_audit",{p_order_id:orderId});
 return error?{ok:false,items:[],error:error.message}:{ok:true,items:Array.isArray(data)?data:[]};
}

export async function unassignOperationsSharedCourier(orderId,reason="Reasignación desde Operaciones"){
 const supabase=getSupabaseBrowserClient();if(!supabase||!orderId)return {ok:false,error:"Pedido inválido."};
 const {data:sessionData}=await supabase.auth.getSession();if(!sessionData?.session)return {ok:false,error:"Inicia sesión con una cuenta de Operaciones."};
 const {data,error}=await supabase.rpc("cf_operations_unassign_courier",{p_order_id:orderId,p_reason:reason});
 return error?{ok:false,error:error.message}:{ok:true,order:Array.isArray(data)?data[0]:data};
}

export async function openOperationsSharedDeliveryIssue(orderId,description){
 const supabase=getSupabaseBrowserClient();if(!supabase||!orderId||!String(description||"").trim())return {ok:false,error:"Pedido o descripción inválidos."};
 const {data,error}=await supabase.rpc("cf_operations_open_delivery_issue",{p_order_id:orderId,p_description:String(description).trim()});
 return error?{ok:false,error:error.message}:{ok:data===true,error:data===true?"":"No se pudo abrir la incidencia."};
}
export async function resolveOperationsSharedDeliveryIssue(orderId,resolution){
 const supabase=getSupabaseBrowserClient();if(!supabase||!orderId||!String(resolution||"").trim())return {ok:false,error:"Pedido o resolución inválidos."};
 const {data,error}=await supabase.rpc("cf_operations_resolve_delivery_issue",{p_order_id:orderId,p_resolution:String(resolution).trim()});
 return error?{ok:false,error:error.message}:{ok:data===true,error:data===true?"":"No se pudo resolver la incidencia."};
}
