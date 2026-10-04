import {supabaseConfig} from "./deployment-readiness.js";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validAccessToken(value){return typeof value==="string"&&value.length>=20&&value.length<=8192&&!/[\s\r\n]/.test(value)}
export function customerOrderPayload(input,customerId){
 if(!input||typeof input!=="object"||!UUID.test(customerId))return null;
 const restaurant=String(input.restaurant||"").trim();
 const address=String(input.address||"").trim();
 const notes=String(input.deliveryNotes||"").trim();
 const items=input.items;
 if(!restaurant||restaurant.length>100||address.length<5||address.length>250||notes.length>250||!Array.isArray(items)||items.length<1||items.length>40)return null;
 const clean=[];
 for(const item of items){
  if(!item||typeof item.name!=="string"||!item.name.trim()||item.name.length>100||!Number.isInteger(item.qty)||item.qty<1||item.qty>50||!Number.isSafeInteger(item.price)||item.price<1||item.price>100000)return null;
  clean.push({name:item.name.trim(),qty:item.qty,price:item.price});
 }
 const hasCoordinates=input.customerCoordinates!=null;
 const lat=hasCoordinates?Number(input.customerCoordinates?.lat):null,lng=hasCoordinates?Number(input.customerCoordinates?.lng):null;
 if(hasCoordinates&&(!Number.isFinite(lat)||lat < -90||lat > 90||!Number.isFinite(lng)||lng < -180||lng > 180))return null;
 const deliveryFee=input.deliveryFee;
 if(!Number.isSafeInteger(deliveryFee)||deliveryFee<0||deliveryFee>10000)return null;
 const computed=clean.reduce((s,item)=>s+item.qty*item.price,deliveryFee);
 if(!Number.isSafeInteger(computed)||computed>100000||computed!==input.total)return null;
 return {customer_id:customerId,restaurant_name:restaurant,delivery_address:address,delivery_notes:notes||null,items:clean,total_cents:computed*100,payment_method:"Efectivo (prueba)",...(hasCoordinates?{delivery_lat:lat,delivery_lng:lng}:{})};
}
export async function authenticatedSupabase(token,env=process.env,fetcher=fetch){
 const config=supabaseConfig(env);
 if(!config||!validAccessToken(token))return null;
 try{
  const response=await fetcher(config.url+"/auth/v1/user",{headers:{apikey:config.anon,Authorization:"Bearer "+token},signal:AbortSignal.timeout(5000),cache:"no-store",redirect:"error"});
  if(!response.ok)return null;
  const user=await response.json();
  if(!UUID.test(user?.id))return null;
  return {config,userId:user.id};
 }catch{return null}
}
export async function customerOrdersRequest(method,token,body,env=process.env,fetcher=fetch){
 const auth=await authenticatedSupabase(token,env,fetcher);
 if(!auth)return {status:401,body:{error:"Inicia sesión para consultar tus pedidos."}};
 const {config,userId}=auth;
 const payload=method==="POST"?customerOrderPayload(body,userId):null;
 if(method==="POST"&&!payload)return {status:400,body:{error:"Revisa los productos, dirección y total del pedido."}};
 if(method==="POST"&&(!Number.isFinite(payload.delivery_lat)||!Number.isFinite(payload.delivery_lng)))return {status:400,body:{error:"Comparte una ubicación válida para crear el pedido compartido."}};
 const url=method==="GET"?config.url+"/rest/v1/rpc/cf_customer_orders":config.url+"/rest/v1/cf_orders";
 try{
  const response=await fetcher(url,{method:method==="GET"?"POST":method,headers:{apikey:config.anon,Authorization:"Bearer "+token,Accept:"application/json",...(method==="POST"?{"Content-Type":"application/json",Prefer:"return=representation"}:{})},...(method==="POST"?{body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(7000),cache:"no-store",redirect:"error"});
  if(!response.ok)return {status:response.status===401||response.status===403?403:503,body:{error:"No se pudo consultar el servidor de pedidos."}};
  const data=await response.json();
  const orders=Array.isArray(data)?data:[];
  if(method==="GET"&&orders.length){
   const enriched=await Promise.all(orders.map(async order=>{try{
    const pinResponse=await fetcher(config.url+"/rest/v1/rpc/cf_customer_delivery_pin",{method:"POST",headers:{apikey:config.anon,Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({p_order_id:order.id}),signal:AbortSignal.timeout(7000),cache:"no-store",redirect:"error"});
    if(!pinResponse.ok)return order;
    const pin=await pinResponse.json();
    return {...order,delivery_pin:typeof pin==="string"?pin:null};
   }catch{return order}}));
   return {status:200,body:{orders:enriched}};
  }
  return {status:method==="POST"?201:200,body:{orders}};
 }catch{return {status:503,body:{error:"El servidor de pedidos no está disponible."}}}
}
