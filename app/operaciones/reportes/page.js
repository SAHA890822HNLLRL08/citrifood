"use client";
import {useEffect,useState} from "react";
import {loadMvp,subscribeOrders} from "../../../lib/mvp-store.js";
import {orderMetrics} from "../../../lib/order-metrics.js";
import "./reportes.css";
const pesos=cents=>(cents/100).toLocaleString("es-MX",{style:"currency",currency:"MXN"});
export default function Reportes(){
 const[orders,setOrders]=useState([]);
 const[from,setFrom]=useState("");const[to,setTo]=useState("");const[restaurant,setRestaurant]=useState("");
 useEffect(()=>{const refresh=()=>setOrders(loadMvp().orders);refresh();return subscribeOrders(refresh)},[]);
 const restaurants=[...new Set(orders.map(o=>o.restaurant).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
 const metrics=orderMetrics(orders,{from,to,restaurant});
 return <main className="reports">
  <header><a href="/operaciones">← Operaciones</a><b>CitriFood · Reportes</b></header>
  <h1>📊 Resumen por restaurante</h1>
  <p>Datos de demostración creados en este navegador. Los pedidos de ejemplo no cuentan. Los importes son el valor de pedidos entregados, no ganancias ni dinero efectivamente cobrado.</p>
  <section className="reportFilters"><label>Desde<input type="date" value={from} max={to||undefined} onChange={e=>setFrom(e.target.value)}/></label><label>Hasta<input type="date" value={to} min={from||undefined} onChange={e=>setTo(e.target.value)}/></label><label>Restaurante<select value={restaurant} onChange={e=>setRestaurant(e.target.value)}><option value="">Todos</option>{restaurants.map(name=><option key={name} value={name}>{name}</option>)}</select></label><button type="button" onClick={()=>{setFrom("");setTo("");setRestaurant("")}} disabled={!from&&!to&&!restaurant}>Limpiar filtros</button></section><p className="reportFilterNote">El periodo se calcula con la fecha de creación del pedido (UTC), no con la fecha de entrega.</p>
  <section className="reportCards">
   <article><small>Pedidos</small><strong>{metrics.total}</strong></article>
   <article><small>Activos</small><strong>{metrics.active}</strong></article>
   <article><small>Entregados</small><strong>{metrics.delivered}</strong></article>
   <article><small>Cancelados / rechazados</small><strong>{metrics.cancelled+metrics.rejected}</strong></article>
  </section>
  <div className="reportTotal"><small>Valor de pedidos entregados · demo</small><strong>{pesos(metrics.deliveredTotalCents)}</strong></div>
  <h2>Detalle por restaurante</h2>
  {metrics.restaurants.length===0?<p>Aún no hay pedidos de prueba. <a href="/">Crear un pedido →</a></p>:
   <div className="reportList">{metrics.restaurants.map(x=><article key={x.restaurant}>
    <h3>{x.restaurant}</h3><p><b>{x.total}</b> pedidos · <b>{x.active}</b> activos · <b>{x.delivered}</b> entregados</p>
    <p>{x.cancelled} cancelados · {x.rejected} rechazados</p>
    <strong>{pesos(x.deliveredTotalCents)} <small>valor entregado</small></strong>
    <a href="/operaciones/pedidos">Consultar pedidos →</a>
   </article>)}</div>}
  <p className="reportNote">No incluye comisiones, impuestos, propinas, reembolsos, gastos, pagos a repartidores ni conciliación bancaria.</p>
 </main>;
}
