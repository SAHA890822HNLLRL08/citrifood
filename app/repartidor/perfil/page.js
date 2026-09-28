"use client";
import {useEffect,useState} from "react";
import "./profile.css";
import {loadCouriers,subscribeCouriers,updateCourier} from "../../../lib/courier-registry.js";
const COURIER_ID="CF-R002";
export default function Perfil(){
 const[courier,setCourier]=useState(null);
 useEffect(()=>{const refresh=()=>setCourier(loadCouriers().find(c=>c.id===COURIER_ID)||null);refresh();return subscribeCouriers(refresh)},[]);
 if(!courier)return <main className="profile"><p>Cargando perfil…</p></main>;
 const response=Math.round(((courier.offers||0)-(courier.unansweredOffers||0))/Math.max(courier.offers||0,1)*100);
 return <main className="profile"><header><a href="/repartidor">← Inicio</a><b>CitriFood</b></header><section className="person"><div>👤</div><h1>{courier.name}</h1><p>{courier.id} · {courier.vehicle||"Vehículo pendiente"} · {courier.documentsApproved?"Documentos verificados":"Documentos pendientes"}</p></section><section className="metrics"><article><b>{response}%</b><small>Respuestas</small></article><article><b>{Math.round((courier.onTimeRate||0)*100)}%</b><small>A tiempo</small></article><article><b>{Number(courier.rating||0).toFixed(1)} ★</b><small>Calificación</small></article><article><b>{courier.validIncidents||0}</b><small>Incidencias verificadas</small></article></section><section className="setting"><div><b>Aceptación automática</b><small>Da prioridad adicional únicamente cuando el pedido sigue siendo compatible y elegible.</small></div><input type="checkbox" checked={courier.autoAccept===true} onChange={e=>updateCourier(courier.id,{autoAccept:e.target.checked})}/></section><section className="history"><h2>Desempeño</h2><p>Pedidos activos <b>{courier.activeOrders||0}</b></p><p>Cancelación <b>{Math.round((courier.cancelRate||0)*100)}%</b></p><p>Ofertas sin respuesta <b>{courier.unansweredOffers||0}</b></p><small>Las ofertas sin respuesta tienen un impacto pequeño y acumulativo. Solo las incidencias verificadas afectan el desempeño.</small></section></main>
}