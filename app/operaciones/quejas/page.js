"use client";
import {useEffect,useState} from "react";
import {getOpenComplaints,subscribeOrders} from "../../../lib/mvp-store.js";
import "./support.css";
const roleName=r=>r==="courier_to_restaurant"?"Repartidor → Restaurante":"Restaurante → Repartidor";
export default function SupportComplaints(){
 const[cases,setCases]=useState([]);const[selected,setSelected]=useState(null);
 useEffect(()=>{const refresh=()=>setCases(getOpenComplaints());refresh();return subscribeOrders(refresh)},[]);
 const pending=cases.filter(x=>x.status==="Pendiente de revisión").length;
 return <main className="supportDesk"><header><div><a href="/operaciones">← Operaciones</a><h1>Quejas y evidencias</h1><p>Bandeja de Soporte · piloto</p></div><strong>{pending} pendientes</strong></header>
 <section className="supportStats"><article><small>Casos abiertos</small><b>{cases.length}</b></article><article><small>Pendientes de revisión</small><b>{pending}</b></article><article><small>Con evidencia</small><b>{cases.filter(x=>x.evidence?.length).length}</b></article></section>
 <section className="caseList">{cases.length===0?<div className="emptyCase"><b>Sin quejas abiertas</b><p>Los reportes de restaurantes y repartidores aparecerán aquí con su pedido y evidencia.</p></div>:cases.map(x=><button key={x.id} onClick={()=>setSelected(x)}><span><small>{x.id} · {x.orderId}</small><b>{x.category}</b><em>{roleName(x.reporterRole)}</em></span><strong>{x.status}</strong></button>)}</section>
 {selected&&<div className="caseModal" onClick={()=>setSelected(null)}><article onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>×</button><small>{selected.id} · Pedido {selected.orderId}</small><h2>{selected.category}</h2><p><b>Origen:</b> {roleName(selected.reporterRole)}</p><p><b>Restaurante:</b> {selected.restaurant||"—"}</p><p><b>Repartidor:</b> {selected.courier?.name||selected.courier||"No asignado"}</p><p><b>Descripción:</b><br/>{selected.description}</p><h3>Evidencia</h3>{selected.evidence?.length?selected.evidence.map((e,i)=><div className="evidence" key={i}>📎 {e.name}<small>{e.type||"archivo"} · {Math.round((e.size||0)/1024)} KB</small></div>):<p>Sin archivos adjuntos.</p>}<div className="warning">La evidencia se revisa antes de aplicar cualquier medida. Esta pantalla piloto todavía no almacena el archivo binario.</div></article></div>}</main>
}