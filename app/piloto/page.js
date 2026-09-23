"use client";
import {useState} from "react";
export default function Piloto(){
 const[email,setEmail]=useState(""),[code,setCode]=useState(""),[accessToken,setAccessToken]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false),[orders,setOrders]=useState([]);
 const[restaurant,setRestaurant]=useState(""),[address,setAddress]=useState(""),[product,setProduct]=useState(""),[price,setPrice]=useState("");
 async function call(path,body,token=""){
  const response=await fetch(path,{method:body===undefined?"GET":"POST",headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),cache:"no-store"});
  const data=await response.json();if(!response.ok)throw Error(data.error||"Error de conexión");return data;
 }
 async function action(fn){setBusy(true);setNotice("");try{await fn()}catch(e){setNotice(e.message||"No se pudo completar la solicitud.")}finally{setBusy(false)}}
 const refresh=async token=>{const data=await call("/api/orders",undefined,token);setOrders(data.orders||[])};
 return <main style={{maxWidth:680,margin:"auto",padding:24,fontFamily:"system-ui"}}>
  <a href="/pruebas">← Centro de pruebas</a><h1>CitriFood · piloto conectado</h1>
  <p><b>En preparación:</b> esta pantalla solo funcionará después de configurar Supabase y aplicar las migraciones. No hay cobros ni repartidores conectados. Usa datos ficticios hasta verificar permisos y privacidad.</p>
  {!accessToken?<section><h2>Acceso por correo</h2><label>Correo electrónico<br/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label><p><button disabled={busy||!email} onClick={()=>action(async()=>{const data=await call("/api/auth/otp",{email});setNotice(data.message)})}>Enviar código</button></p><label>Código recibido (6–8 dígitos)<br/><input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value)}/></label><p><button disabled={busy||!code} onClick={()=>action(async()=>{const data=await call("/api/auth/verify",{email,code});setAccessToken(data.accessToken);setCode("");setNotice("Sesión temporal iniciada.");await refresh(data.accessToken)})}>Entrar al piloto</button></p><small>La sesión se guarda solo en memoria de esta pestaña; se pierde al recargar o cerrar.</small></section>:
  <section><button onClick={()=>{setAccessToken("");setOrders([]);setNotice("Sesión cerrada en esta pestaña.")}}>Cerrar sesión</button><h2>Mis pedidos del servidor</h2><button disabled={busy} onClick={()=>action(()=>refresh(accessToken))}>Actualizar pedidos</button>{orders.length===0?<p>Sin pedidos compartidos para esta cuenta.</p>:<ul>{orders.map(o=><li key={o.id}><b>{o.restaurant_name}</b> · {o.status} · $ {(o.total_cents/100).toFixed(2)} · {o.id}</li>)}</ul>}
  <h2>Crear pedido de prueba</h2><p>Este formulario comprueba la conexión y los permisos de una cuenta. No realiza compras reales.</p><label>Restaurante<br/><input value={restaurant} maxLength={100} onChange={e=>setRestaurant(e.target.value)}/></label><p><label>Dirección ficticia de prueba<br/><input value={address} maxLength={250} onChange={e=>setAddress(e.target.value)}/></label></p><label>Producto<br/><input value={product} maxLength={100} onChange={e=>setProduct(e.target.value)}/></label><p><label>Precio en pesos enteros<br/><input type="number" min="1" max="100000" value={price} onChange={e=>setPrice(e.target.value)}/></label></p><button disabled={busy||!restaurant||!address||!product||!price} onClick={()=>action(async()=>{const amount=Number(price);const data=await call("/api/orders",{restaurant,address,items:[{name:product,qty:1,price:amount}],deliveryFee:0,total:amount},accessToken);setNotice("Pedido de prueba guardado en el servidor: "+(data.orders[0]?.id||""));await refresh(accessToken)})}>Guardar pedido de prueba</button></section>}
  {notice&&<p role="status">{notice}</p>}
 </main>
}
