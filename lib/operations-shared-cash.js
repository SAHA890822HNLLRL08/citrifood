import {getSupabaseBrowserClient} from "./supabase-client.js";
export async function fetchOperationsCashBalances(){
 const supabase=getSupabaseBrowserClient();if(!supabase)return {ok:false,error:"Supabase no está configurado."};
 const {data:session}=await supabase.auth.getSession();if(!session?.session)return {ok:false,error:"Inicia sesión con una cuenta de Operaciones."};
 const {data,error}=await supabase.rpc("cf_operations_courier_cash_balances");
 return error?{ok:false,error:error.message}:{ok:true,drivers:Array.isArray(data)?data:[]};
}
export async function recordOperationsCashPayment(courierId,amountCents,note=""){
 const supabase=getSupabaseBrowserClient();if(!supabase)return {ok:false,error:"Supabase no está configurado."};
 const amount=Number(amountCents);if(!courierId||!Number.isSafeInteger(amount)||amount<=0)return {ok:false,error:"Captura un depósito válido."};
 const {data,error}=await supabase.rpc("cf_operations_record_courier_cash_payment",{p_courier_id:courierId,p_amount_cents:amount,p_note:note||null});
 return error?{ok:false,error:error.message}:{ok:true,appliedCents:Number(data)||0};
}
