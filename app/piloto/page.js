"use client";
import {useEffect,useState} from "react";
export default function Piloto(){
 const[email,setEmail]=useState(""),[code,setCode]=useState(""),[accessToken,setAccessToken]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false),[orders,setOrders]=useState([]);
 const[courierName,setCourierName]=useState(null),[courierOrders,setCourierOrders]=useState([]),[couriers,setCouriers]=useState([]),[selectedCourier,setSelectedCourier]=useState(""),[operationsOrders,setOperationsOrders]=useState([]),[restaurantOrders,setRestaurantOrders]=useState([]),[assignedRestaurants,setAssignedRestaurants]=useState([]);
 const[restaurant,setRestaurant]=useState(""),[address,setAddress]=useState(""),[product,setProduct]=useState(""),[price,setPrice]=useState("");
 async function call(path,body,token=""){
  const response=await fetch(path,{method:body===undefined?"GET":"POST",headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),cache:"no-store"});
  const data=await response.json();if(!response.ok)throw Error(data.error||"Error de conexión");return data;
 }
 async function action(fn){setBusy(true);setNotice("");try{await fn()}catch(e){setNotice(e.message||"No se pudo completar la solicitud.")}finally{setBusy(false)}}
 const refresh=async token=>{const [customer,staff,ops]=await Promise.all([call("/api/orders",undefined,token),call("/api/restaurant/orders",undefined,token),call("/api/operations/orders",undefined,token).catch(()=>({orders:[]}))]);setOrders(customer.orders||[]);setRestaurantOrders(staff.orders||[]);setAssignedRestaurants(staff.restaurants||[]);setOperationsOrders(ops.orders||[]);const roster=await call("/api/operations/couriers",undefined,token).catch(()=>({couriers:[]}));setCouriers(roster.couriers||[]);const delivery=await call("/api/courier/orders",undefined,token).catch(()=>({courier:null,orders:[]}));setCourierName(delivery.courier||null);setCourierOrders(delivery.orders||[])};
 useEffect(()=>{
  if(!accessToken)return;
  let active=true;
  const refreshSilently=async()=>{
   try{
    const [customer,staff,ops,roster,delivery]=await Promise.all([
     call("/api/orders",undefined,accessToken),
     call("/api/restaurant/orders",undefined,accessToken),
     call("/api/operations/orders",undefined,accessToken).catch(()=>({orders:[]})),
     call("/api/operations/couriers",undefined,accessToken).catch(()=>({couriers:[]})),
     call("/api/courier/orders",undefined,accessToken).catch(()=>({courier:null,orders:[]}))
    ]);
    if(!active)return;
    setOrders(customer.orders||[]);
    setRestaurantOrders(staff.orders||[]);
    setAssignedRestaurants(staff.restaurants||[]);
    setOperationsOrders(ops.orders||[]);
    setCouriers(roster.couriers||[]);
    setCourierName(delivery.courier||null);
    setCourierOrders(delivery.orders||[]);
   }catch{ /* Manual refresh displays errors. */ }
  };
  const timer=setInterval(refreshSilently,10000);
  window.addEventListener("focus",refreshSilently);
  return()=>{active=false;clearInterval(timer);window.removeEventListener("focus",refreshSilently)};
 },[accessToken]);
 return <main style={{maxWidth:680,margin:"auto",padding:24,fontFamily:"system-ui"}}>
  <a href="/pruebas">← Centro de pruebas</a><h1>CitriFood · piloto conectado</h1>
  <p><b>En preparación:</b> esta pantalla solo funcionará después de configurar Supabase y aplicar las migraciones. No hay cobros ni repartidores conectados. Usa datos ficticios hasta verificar permisos y privacidad.</p>
  {!accessToken?<section><h2>Acceso por correo</h2><label>Correo electrónico<br/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label><p><button disabled={busy||!email} onClick={()=>action(async()=>{const data=await call("/api/auth/otp",{email});setNotice(data.message)})}>Enviar código</button></p><label>Código recibido (6–8 dígitos)<br/><input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value)}/></label><p><button disabled={busy||!code} onClick={()=>action(async()=>{const data=await call("/api/auth/verify",{email,code});setAccessToken(data.accessToken);setCode("");setNotice("Sesión temporal iniciada.");await refresh(data.accessToken)})}>Entrar al piloto</button></p><small>La sesión se guarda solo en memoria de esta pestaña; se pierde al recargar o cerrar.</small></section>:
  <section><button onClick={()=>{setAccessToken("");setOrders([]);setCourierOrders([]);setCourierName(null);setOperationsOrders([]);setCouriers([]);setSelectedCourier("");setRestaurantOrders([]);setAssignedRestaurants([]);setNotice("Sesión cerrada en esta pestaña.")}}>Cerrar sesión</button><h2>Mis pedidos del servidor</h2><p><small>Se actualizan cada 10 segundos mientras tengas abierta esta pantalla. En otro celular, entra con el mismo correo para comprobar que se guardan en la misma cuenta.</small></p><button disabled={busy} onClick={()=>action(()=>refresh(accessToken))}>Actualizar pedidos</button>{orders.length===0?<p>Sin pedidos compartidos para esta cuenta.</p>:<ul>{orders.map(o=><li key={o.id}><b>{o.restaurant_name}</b> · {o.status} · $ {(o.total_cents/100).toFixed(2)} · {o.id}</li>)}</ul>}
  <h2>📥 Bandeja del restaurante (piloto)</h2><p><small>Solo aparecen pedidos de restaurantes asignados a tu cuenta por el administrador. Actualización cada 10 segundos. Puedes aceptar pedidos nuevos y marcarlos listos. El despacho y los cobros siguen deshabilitados.</small></p>{assignedRestaurants.length===0?<p>Esta cuenta no tiene restaurantes asignados para la prueba.</p>:<><p><b>Restaurantes asignados:</b> {assignedRestaurants.join(", ")}</p>{restaurantOrders.length===0?<p>Sin pedidos para estos restaurantes.</p>:<ul>{restaurantOrders.map(o=><li key={o.id}><b>{o.restaurant_name}</b> · {o.status} · $ {(o.total_cents/100).toFixed(2)} · {o.id} {["Nuevo","Preparando"].includes(o.status)&&<button disabled={busy} onClick={()=>action(async()=>{const next=o.status==="Nuevo"?"Preparando":"Listo";await call("/api/restaurant/orders/"+encodeURIComponent(o.id)+"/status",{status:next},accessToken);await refresh(accessToken);setNotice("Pedido actualizado a "+next+".")})}>{o.status==="Nuevo"?"Aceptar y preparar":"Marcar listo"}</button>}</li>)}</ul>}</>}
  <h2>🗂️ Operaciones (piloto)</h2><p><small>Solo cuentas autorizadas por el administrador. Sin direcciones. Operaciones puede asignar un pedido listo a un repartidor autorizado; esta asignación de prueba pasa directamente a En entrega.</small></p>{couriers.length>0&&<p><label>Repartidor de prueba: <select value={selectedCourier} onChange={e=>setSelectedCourier(e.target.value)}><option value="">Seleccionar repartidor</option>{couriers.map(c=><option key={c.user_id} value={c.user_id}>{c.display_name}</option>)}</select></label></p>}{operationsOrders.length===0?<p>Sin pedidos visibles o cuenta no autorizada para Operaciones.</p>:<ul>{operationsOrders.map(o=><li key={o.id}><b>{o.restaurant_name}</b> · {o.status} · $ {(o.total_cents/100).toFixed(2)} · {o.id} {o.status==="Listo"&&<button disabled={busy||!selectedCourier} onClick={()=>action(async()=>{await call("/api/operations/orders/"+encodeURIComponent(o.id)+"/assign",{courierId:selectedCourier},accessToken);await refresh(accessToken);setNotice("Pedido asignado al repartidor de prueba.")})}>Asignar repartidor</button>}</li>)}</ul>}
  <h2>🛵 Repartidor (piloto)</h2><p><small>Solo pedidos asignados a tu cuenta verificada. Confirmar entrega es una simulación: aún no hay GPS, fotografía, PIN ni cobro.</small></p>{!courierName?<p>Esta cuenta no está habilitada como repartidor de prueba.</p>:<><p><b>Repartidor:</b> {courierName}</p>{courierOrders.length===0?<p>Sin pedidos asignados.</p>:<ul>{courierOrders.map(o=><li key={o.id}><b>{o.restaurant_name}</b> · {o.status} · {o.id} {o.status==="En entrega"&&<button disabled={busy} onClick={()=>action(async()=>{await call("/api/courier/orders/"+encodeURIComponent(o.id)+"/deliver",{},accessToken);await refresh(accessToken);setNotice("Entrega de prueba confirmada.")})}>Confirmar entrega de prueba</button>}</li>)}</ul>}</>}
  <h2>Crear pedido de prueba</h2><p>Este formulario comprueba la conexión y los permisos de una cuenta. No realiza compras reales.</p><label>Restaurante<br/><input value={restaurant} maxLength={100} onChange={e=>setRestaurant(e.target.value)}/></label><p><label>Dirección ficticia de prueba<br/><input value={address} maxLength={250} onChange={e=>setAddress(e.target.value)}/></label></p><label>Producto<br/><input value={product} maxLength={100} onChange={e=>setProduct(e.target.value)}/></label><p><label>Precio en pesos enteros<br/><input type="number" min="1" max="100000" value={price} onChange={e=>setPrice(e.target.value)}/></label></p><button disabled={busy||!restaurant||!address||!product||!price} onClick={()=>action(async()=>{const amount=Number(price);const data=await call("/api/orders",{restaurant,address,items:[{name:product,qty:1,price:amount}],deliveryFee:0,total:amount},accessToken);setNotice("Pedido de prueba guardado en el servidor: "+(data.orders[0]?.id||""));await refresh(accessToken)})}>Guardar pedido de prueba</button></section>}
  {notice&&<p role="status">{notice}</p>}
 </main>
}
