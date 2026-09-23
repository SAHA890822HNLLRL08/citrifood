"use client";
import {useState} from "react";
import {canMessageOrder,orderMessages,sendOrderMessage} from "../lib/order-chat.js";
import "./order-chat.css";
export default function OrderChat({order,role}){
 const[draft,setDraft]=useState("");
 const[notice,setNotice]=useState("");
 if(!order)return null;
 const available=canMessageOrder(order,role);
 const messages=orderMessages(order);
 return <section className="orderChat" aria-label="Mensajes del pedido">
  <h3>💬 Mensajes dentro de CitriFood · DEMO</h3>
  <p>Comunicación por pedido sin mostrar teléfonos. Estos mensajes solo funcionan en pestañas del mismo navegador; todavía no hay llamadas, notificaciones ni chat entre teléfonos.</p>
  <div className="orderChatMessages" aria-live="polite">{messages.length===0?<p>Sin mensajes todavía.</p>:messages.map(m=><article key={m.id} className={m.role===role?"own":""}><b>{m.role}</b><p>{m.body}</p><small>{new Date(m.at).toLocaleString("es-MX")}</small></article>)}</div>
  {available?<form onSubmit={e=>{e.preventDefault();if(sendOrderMessage(order.id,role,draft)){setDraft("");setNotice("Mensaje guardado en esta demostración.")}else setNotice("No se pudo guardar el mensaje.")}}><label>Mensaje para {role==="Cliente"?"tu repartidor":"el cliente"}<textarea maxLength={500} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Escribe aquí; no compartas tu número personal" required/></label><button type="submit" disabled={!draft.trim()}>Enviar mensaje (demo)</button></form>:<p>Mensajería no disponible para este pedido o rol.</p>}
  {notice&&<small role="status">{notice}</small>}
  <p className="orderChatPrivacy">🔒 Los teléfonos no aparecen en esta conversación. La llamada privada dentro de la app requiere un proveedor de voz y un backend seguro; aún no está habilitada.</p>
 </section>
}
