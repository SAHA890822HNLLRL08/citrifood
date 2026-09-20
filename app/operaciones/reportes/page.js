"use client";
import {useEffect,useState} from "react";
import {loadMvp,subscribeOrders} from "../../../lib/mvp-store.js";
import {orderMetrics} from "../../../lib/order-metrics.js";
import "./reportes.css";
const pesos=cents=>(cents/100).toLocaleString("es-MX",{style:"currency",currency:"MXN"});
export default function Reportes(){
 const[orders,setOrders]=useState([]);
 useEffect(()=>{const refresh=()=>setOrders(loadMvp().orders);refresh();return subscribeOrders(refresh)},[]);
 const metrics=orderMetrics(orders);
 return <main className="reports">
  <header><a href="/operaciones">← Operaciones</a><b>CitriFood · Reportes</b></header>
  <h1>📊 Resumen por restaurante</h1>
  <p>Datos de demostración creados en este navegador. Los pedidos de ejemplo no cuentan. Los importes son el valor de pedidos entregados, no ganancias ni dinero efectivamente cobrado.</p>
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
