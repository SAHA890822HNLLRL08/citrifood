"use client";
import {useEffect,useState} from "react";
import {loadMvp,resolveDeliveryIssue,subscribeOrders,updateOrder} from "../../../lib/mvp-store.js";
import "./orders.css";
import {ordersToCsv} from "../../../lib/order-export.js";
import {orderMessages} from "../../../lib/order-chat.js";

const seed=[
 {id:"CF-DEMO-3",restaurant:"Tacos El Centro",customer:"María (ejemplo)",courier:"Sin asignar",status:"Preparando",payment:"Efectivo",total:245},
 {id:"CF-DEMO-4",restaurant:"Burger House",customer:"José (ejemplo)",courier:"Juan Pérez",status:"En entrega",payment:"Tarjeta",total:210}
];
const statuses=["Todos","Nuevo","Preparando","Listo","Esperando repartidor","En entrega","Entregado","Rechazado","Cancelado"];

export default function Pedidos(){
 const[filter,setFilter]=useState("Todos");
 const[query,setQuery]=useState("");
 const[actual,setActual]=useState([]);
 const[expanded,setExpanded]=useState(null);const[issuesOnly,setIssuesOnly]=useState(false);
 useEffect(()=>{const refresh=()=>setActual(loadMvp().orders);refresh();return subscribeOrders(refresh)},[]);
 useEffect(()=>{const id=new URLSearchParams(window.location.search).get("order");if(id){setQuery(id);setExpanded(id)}},[]);
 const downloadCsv=()=>{const content=ordersToCsv(rows.filter(o=>!o.id.startsWith("CF-DEMO-")));const blob=new Blob([content],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="citrifood-pedidos-demo-"+new Date().toISOString().slice(0,10)+".csv";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 const all=[...actual,...seed];
 const search=query.trim().toLocaleLowerCase("es-MX");
 const rows=all.filter(x=>(!issuesOnly||x.deliveryIssue&&!x.deliveryIssue.resolvedAt)&&(filter==="Todos"||x.status===filter)&&(!search||[x.id,x.restaurant,x.customer,x.address,x.deliveryNotes,x.courier].some(v=>String(v||"").toLocaleLowerCase("es-MX").includes(search))));
 return <main className="ordersAdmin">
  <header><a href="/operaciones">← Operaciones</a><b>CitriFood · Pedidos</b></header>
  <h1>Pedidos</h1>
  <p>Pedidos de este navegador y ejemplos identificados. Asignación manual de demostración; no hay datos compartidos entre dispositivos.</p>
  <label className="orderSearch">Buscar pedido, restaurante, cliente o dirección
   <input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ej. CF-, Burger House o Centro"/>
  </label>
  <div className="filters">{statuses.map(x=><button type="button" className={filter===x?"on":""} onClick={()=>setFilter(x)} key={x}>{x} ({x==="Todos"?all.length:all.filter(o=>o.status===x).length})</button>)}</div>
  <label className="issueFilter"><input type="checkbox" checked={issuesOnly} onChange={e=>setIssuesOnly(e.target.checked)}/> Solo incidencias pendientes ({actual.filter(o=>o.deliveryIssue&&!o.deliveryIssue.resolvedAt).length})</label><div className="orderToolbar"><p className="orderCount">{rows.length} pedidos mostrados</p><button type="button" disabled={!rows.some(o=>!o.id.startsWith("CF-DEMO-"))} onClick={downloadCsv}>↓ Exportar pedidos filtrados (CSV)</button></div>
  <section>{rows.length===0&&<p>No hay pedidos que coincidan con la búsqueda o el estado.</p>}
   {rows.map(x=><article key={x.id}>
    <div><small>{x.id}{x.id.startsWith("CF-DEMO-")?" · EJEMPLO":""}</small><h2>{x.restaurant}</h2><p>{x.customer} · {x.paymentMethod||x.payment} · $ {x.total}</p></div>
    <div className="orderActions"><strong>{x.status}</strong>{x.deliveryIssue&&!x.deliveryIssue.resolvedAt&&<b className="issueBadge">⚠️ Incidencia pendiente</b>}<small>{x.courier||"Sin asignar"}</small>
     {!x.id.startsWith("CF-DEMO-")&&["Listo","Esperando repartidor"].includes(x.status)&&<button type="button" className="assignButton" onClick={()=>updateOrder(x.id,{status:"En entrega",courier:"Juan Pérez (demo)"})}>Asignar a Juan (demo)</button>}
     <button type="button" className="detailButton" aria-expanded={expanded===x.id} onClick={()=>setExpanded(v=>v===x.id?null:x.id)}>{expanded===x.id?"Ocultar detalle":"Ver detalle"}</button>
    </div>
    {expanded===x.id&&<div className="orderDetails">
     {x.id.startsWith("CF-DEMO-")?<p>Esta tarjeta es ilustrativa y no contiene datos de un cliente real.</p>:<>
      <p><b>Dirección:</b> {x.address||"No registrada"}</p>{x.deliveryNotes&&<p><b>Indicaciones de entrega:</b> {x.deliveryNotes}</p>}
      <p><b>Creado:</b> {x.createdAt?new Date(x.createdAt).toLocaleString("es-MX"):"Sin fecha"}</p>
      <p><b>Envío:</b> $ {x.deliveryFee??"No registrado"}</p>
      {x.deliveryIssue&&<div className="opsIssue"><h3>⚠️ Incidencia de entrega</h3><p>{x.deliveryIssue.description}</p><small>Reportada: {new Date(x.deliveryIssue.reportedAt).toLocaleString("es-MX")}</small>{x.deliveryIssue.resolvedAt?<p>Atendida: {new Date(x.deliveryIssue.resolvedAt).toLocaleString("es-MX")}</p>:<button type="button" onClick={()=>resolveDeliveryIssue(x.id)}>Marcar como atendida (demo)</button>}</div>}{x.deliveryIssueHistory?.length>1&&<details className="opsIssueHistory"><summary>Incidencias anteriores ({x.deliveryIssueHistory.length-1})</summary>{x.deliveryIssueHistory.slice(0,-1).map((issue,i)=><p key={i}>{issue.description} · {issue.resolvedAt?"Atendida":"Pendiente"}</p>)}</details>}<h3>Productos</h3>
      <ul>{(Array.isArray(x.items)?x.items:[]).map((item,i)=><li key={i}>{item.qty} × {item.name} · $ {(item.price*item.qty).toFixed(2)}</li>)}</ul>
      <details className="opsChatEvidence"><summary>💬 Chat del pedido · evidencia temporal ({orderMessages(x).length} mensajes)</summary><p>Los mensajes se conservan hasta 15 días desde su envío en este navegador de prueba.</p>{orderMessages(x).length===0?<p>No hay mensajes vigentes.</p>:orderMessages(x).map(m=><article key={m.id}><b>{m.role}</b><p>{m.body}</p><small>{new Date(m.at).toLocaleString("es-MX")}</small></article>)}</details><h3>Movimientos</h3>
      <ol>{(x.statusHistory||[]).map((event,i)=><li key={i}>{event.status} · {new Date(event.at).toLocaleString("es-MX")}</li>)}</ol>
     </>}
    </div>}
   </article>)}
  </section>
 </main>;
}
