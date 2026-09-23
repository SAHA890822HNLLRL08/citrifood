"use client";
import {useEffect,useState} from "react";
import {loadMvp,resolveDeliveryIssue,subscribeOrders} from "../../../lib/mvp-store.js";
import {incidentRows} from "../../../lib/incident-report.js";
import "./incidents.css";
export default function Incidencias(){
 const[orders,setOrders]=useState([]);
 const[filter,setFilter]=useState("Pendiente");
 useEffect(()=>{const refresh=()=>setOrders(loadMvp().orders);refresh();return subscribeOrders(refresh)},[]);
 const incidents=incidentRows(orders);
 const pending=incidents.filter(x=>x.status==="Pendiente").length;
 const shown=incidents.filter(x=>filter==="Todas"||x.status===filter);
 return <main className="inc">
  <header><a href="/operaciones">← Operaciones</a><b>CitriFood · Incidencias</b></header>
  <h1>⚠️ Incidencias de entrega</h1>
  <p>Reportes de repartidores asociados a pedidos de prueba de este navegador. No son quejas verificadas ni sanciones; no se sincronizan entre dispositivos.</p>
  <section className="incStats"><article><small>Pendientes</small><strong>{pending}</strong></article><article><small>Atendidas</small><strong>{incidents.filter(x=>x.status==="Atendida").length}</strong></article><article><small>Historial total</small><strong>{incidents.length}</strong></article></section>
  <div className="incFilters">{["Pendiente","Atendida","Todas"].map(x=><button type="button" key={x} className={filter===x?"selected":""} onClick={()=>setFilter(x)}>{x}</button>)}</div>
  {shown.length===0?<p className="incEmpty">No hay incidencias en esta categoría. Para probarlo, asigna un pedido desde <a href="/operaciones/pedidos">Operaciones → Pedidos</a> y repórtalo desde <a href="/repartidor">Repartidor</a>.</p>:
  shown.map(x=><article key={x.id} className="incCard"><div><small>{x.orderId} · {x.restaurant}</small><h2>{x.description}</h2><p>Repartidor: {x.courier}</p><p>Pedido: {x.orderStatus}</p><small>Reportada: {x.reportedAt?new Date(x.reportedAt).toLocaleString("es-MX"):"Sin fecha"}</small>{x.resolvedAt&&<p>Atendida: {new Date(x.resolvedAt).toLocaleString("es-MX")}</p>}</div><strong>{x.status}</strong><div className="buttons"><a href={"/operaciones/pedidos?order="+encodeURIComponent(x.orderId)}>Ver pedido →</a>{x.status==="Pendiente"&&x.isCurrent&&<button type="button" onClick={()=>resolveDeliveryIssue(x.orderId)}>Marcar atendida (demo)</button>}</div></article>)}
 </main>;
}
