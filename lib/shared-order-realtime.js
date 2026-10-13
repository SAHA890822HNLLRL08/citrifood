import {getSupabaseBrowserClient} from "./supabase-client.js";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function subscribeSharedOrders({scope="orders",orderId=null,onChange}={}){
 const supabase=getSupabaseBrowserClient();
 if(!supabase||typeof onChange!=="function")return ()=>{};
 const filter=orderId&&UUID.test(String(orderId))?`id=eq.${orderId}`:undefined;
 const config={event:"*",schema:"public",table:"cf_orders",...(filter?{filter}:{})};
 const channel=supabase.channel(`citrifood-${scope}-${orderId||"all"}`)
  .on("postgres_changes",config,payload=>onChange(payload))
  .subscribe();
 return ()=>{supabase.removeChannel(channel)};
}
