"use client";
import "./operations.css";
import {useEffect,useState} from "react";
import {loadMvp,subscribeOrders} from "../../lib/mvp-store.js";
import {loadCouriers,reactivateCourier,subscribeCouriers,suspendCourier} from "../../lib/courier-registry.js";
import {courierDocumentAlerts} from "../../lib/courier-documents.js";
import {fetchOperationsCashBalances,fetchOperationsCashLedger,recordOperationsCashPayment} from "../../lib/operations-shared-cash.js";

const responseRate=x=>Math.round((((x.offers||0)-(x.unansweredOffers||0))/Math.max(x.offers||0,1))*100);

export default function Operations(){
 const[drivers,setDrivers]=useState([]);
 const[filter,setFilter]=useState("Todos");
 const[selected,setSelected]=useState(null);
 const[suspensionReason,setSuspensionReason]=useState("");
 const[orders,setOrders]=useState([]);
 const[sharedCash,setSharedCash]=useState([]);const[cashNotice,setCashNotice]=useState("");const[cashAmounts,setCashAmounts]=useState({});const[cashLedger,setCashLedger]=useState({});

 useEffect(()=>{const refresh=()=>setOrders(loadMvp().orders);refresh();return subscribeOrders(refresh)},[]);
 useEffect(()=>{const refresh=()=>setDrivers(loadCouriers());refresh();return subscribeCouriers(refresh)},[]);
 useEffect(()=>{refreshCash();const timer=setInterval(refreshCash,15000);return()=>clearInterval(timer)},[]);
 async function refreshCash(){const r=await fetchOperationsCashBalances();if(r.ok){setSharedCash(r.drivers);setCashNotice("")}else setCashNotice(r.error||"No se pudo consultar la cartera compartida.")}
 async function toggleCashLedger(driver){if(cashLedger[driver.user_id]){setCashLedger(v=>({...v,[driver.user_id]:null}));return}const r=await fetchOperationsCashLedger(driver.user_id);if(!r.ok){setCashNotice(r.error||"No se pudo consultar el historial.");return}setCashLedger(v=>({...v,[driver.user_id]:r.movements}))}
 async function registerCashPayment(driver){const pesos=Number(cashAmounts[driver.user_id]);if(!Number.isFinite(pesos)||pesos<=0){setCashNotice("Captura un depósito mayor a $0.");return}const cents=Math.round(pesos*100);const r=await recordOperationsCashPayment(driver.user_id,cents,"Depósito registrado desde Operaciones");if(!r.ok){setCashNotice(r.error||"No se pudo registrar el depósito.");return}setCashAmounts(v=>({...v,[driver.user_id]:""}));await refreshCash();setCashNotice(`Depósito aplicado: $ ${(r.appliedCents/100).toFixed(2)}.`)}

 const visible=filter==="Todos"?drivers:drivers.filter(x=>x.status===filter);
 const counts={
  online:drivers.filter(x=>x.online===true).length,
  busy:drivers.filter(x=>x.status==="En entrega").length,
  finishing:drivers.filter(x=>x.status==="Terminando jornada").length,
  free:drivers.filter(x=>x.status==="Disponible").length,
  off:drivers.filter(x=>x.status==="Desconectado").length
 };
 const refreshSelected=id=>setSelected(loadCouriers().find(c=>c.id===id)||null);
 const suspend=()=>{if(!selected||!suspensionReason.trim())return;suspendCourier(selected.id,{reason:suspensionReason.trim()});refreshSelected(selected.id);setSuspensionReason("")};
 const reactivate=()=>{if(!selected)return;reactivateCourier(selected.id);refreshSelected(selected.id)};
 const documentAlerts=selected?.documents?courierDocumentAlerts(selected.documents):[];

 return <div className="ops">
  <aside>
   <b className="brand">CitriFood</b><span>Centro de Operaciones</span>
   <a className="active">📊 Resumen</a><a href="/repartidor">🛵 Repartidores</a><a href="/operaciones/pedidos">🧾 Pedidos</a>
   <a href="/operaciones/reportes">📊 Reportes</a><a href="/operaciones/finanzas">💰 Finanzas</a><a href="/operaciones/asignacion">⚡ Asignación</a>
   <a href="/restaurante">🏪 Restaurantes</a><a href="/operaciones/solicitudes">👥 Solicitudes</a><a href="/operaciones/incidencias">⚠️ Incidencias</a>
   <a href="/operaciones/quejas">🛡️ Quejas / Soporte</a>
  </aside>
  <main className="opsmain">
   <div className="ophead"><div><h1>Centro de operaciones · MVP</h1><p>Pedidos y repartidores sincronizados dentro del piloto.</p></div><a href="/operaciones/solicitudes">+ Solicitudes de repartidores</a></div>
   <section className="stats">
    <article><small>Conectados</small><b>{counts.online}</b></article><article><small>Entregando</small><b>{counts.busy}</b></article>
    <article><small>Terminando jornada</small><b>{counts.finishing}</b></article><article><small>Disponibles</small><b>{counts.free}</b></article>
    <article><small>Desconectados</small><b>{counts.off}</b></article>
   </section>
   <section className="stats">
    <article><small>Pedidos de prueba</small><b>{orders.length}</b></article><article><small>Por aceptar</small><b>{orders.filter(o=>o.status==="Nuevo").length}</b></article>
    <article><small>En entrega</small><b>{orders.filter(o=>o.status==="En entrega").length}</b></article><article><small>Entregados</small><b>{orders.filter(o=>o.status==="Entregado").length}</b></article>
    <article><small>⚠️ Incidencias pendientes</small><b>{orders.filter(o=>o.deliveryIssue&&!o.deliveryIssue.resolvedAt).length}</b><a href="/operaciones/pedidos">Atender →</a></article><article><small>🆘 Cliente sin respuesta</small><b>{orders.filter(o=>o.supportReview?.type==="customer_no_response"&&o.supportReview?.status==="Pendiente").length}</b><a href="/operaciones/pedidos">Revisar →</a></article>
   </section>
   <p><a href="/operaciones/pedidos">Abrir pedidos y asignaciones →</a> · <a href="/operaciones/reportes">Ver reporte por restaurante →</a></p>
   <section className="mapmock"><div className="maplabel"><b>Mapa operativo</b><small>GPS se comparte únicamente durante operación.</small></div><i className="pin p1">🛵</i><i className="pin p2">🛵</i><i className="pin p3">📦</i></section>
   <section className="driverPanel"><div className="panelhead"><h2>Cartera compartida · efectivo</h2><button onClick={refreshCash}>Actualizar</button></div>{cashNotice&&<p>{cashNotice}</p>}<div className="driverTable"><div className="tr th"><span>Repartidor</span><span>Estado</span><span>Adeudo</span><span>Comprometido / disponible</span><span>Depósito</span><span></span></div>{sharedCash.map(x=><div className="tr" key={"cash-"+x.user_id}><span><b>{x.display_name||"Repartidor"}</b><small>{x.user_id}</small></span><span>{x.active?"Activo":"Inactivo"}</span><span><b>$ {(Number(x.cash_debt_cents||0)/100).toFixed(2)}</b></span><span>$ {(Number(x.committed_cash_cents||0)/100).toFixed(2)} / <b>$ {(Number(x.available_cash_cents||0)/100).toFixed(2)}</b></span><span><input type="number" min="0.01" step="0.01" value={cashAmounts[x.user_id]||""} onChange={e=>setCashAmounts(v=>({...v,[x.user_id]:e.target.value}))} placeholder="$ depósito"/></span><span><button onClick={()=>registerCashPayment(x)}>Aplicar</button><button onClick={()=>toggleCashLedger(x)}>{cashLedger[x.user_id]?"Ocultar":"Movimientos"}</button></span>{cashLedger[x.user_id]&&<div className="actions"><b>Últimos movimientos</b>{cashLedger[x.user_id].length===0?<span>Sin movimientos registrados.</span>:cashLedger[x.user_id].slice(0,10).map(m=><span key={m.id}>{m.amount_cents>0?"+":"−"}$ {(Math.abs(m.amount_cents)/100).toFixed(2)} · {m.kind==="cash_order"?"Pedido en efectivo":m.kind==="deposit"?"Depósito":"Ajuste"}{m.order_id?" · pedido "+m.order_id.slice(0,8):""}</span>)}</div>}</div>)}</div></section>
   <section className="driverPanel">
    <div className="panelhead"><h2>Repartidores</h2><div>{["Todos","Disponible","En entrega","Terminando jornada","Desconectado","Suspendido"].map(x=><button className={filter===x?"on":""} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div></div>
    <div className="driverTable">
     <div className="tr th"><span>Repartidor</span><span>Estado</span><span>Zona</span><span>Pedidos</span><span>Respuesta</span><span></span></div>
     {visible.map(x=><button className="tr" onClick={()=>{setSelected(x);setSuspensionReason("")}} key={x.id}>
      <span><b>{x.name}</b><small>{x.id}</small></span>
      <span className={"status "+String(x.status||"Desconectado").replaceAll(" ","").toLowerCase()}>{x.status||"Desconectado"}</span>
      <span>{x.zone||"—"}</span><span>{x.activeOrders||0}</span><span>{responseRate(x)}%</span><span>›</span>
     </button>)}
    </div>
   </section>
   {selected&&<div className="modalbg" onClick={()=>setSelected(null)}>
    <div className="driverModal" onClick={e=>e.stopPropagation()}>
     <button className="x" onClick={()=>setSelected(null)}>×</button>
     <div className="avatar">👤</div><h2>{selected.name}</h2><p>{selected.id} · {selected.status||"Desconectado"}</p><hr/>
     <p><b>Teléfono:</b> {selected.phone||"—"}</p><p><b>Vehículo:</b> {selected.vehicle||"—"}</p>
     <p><b>Documentos:</b> {selected.documentsApproved?"Verificados":"Pendientes"}</p>{documentAlerts.length>0&&<div className="actions"><b>⚠️ Atención documental</b>{documentAlerts.map(item=><span key={item.key}>{item.key==="identity"?"Identidad":item.key==="license"?"Licencia":"Vehículo"}: {item.state==="expired"?"Vencido":item.state==="expiring"?`Vence en ${item.daysLeft} día${item.daysLeft===1?"":"s"}`:item.state==="invalid"?"Fecha inválida":"Pendiente de verificar"}</span>)}</div>}<p><b>Pedidos activos:</b> {selected.activeOrders||0}</p>
     <p><b>Respuesta a ofertas:</b> {responseRate(selected)}%</p>
     {selected.status==="Terminando jornada"&&<div className="actions"><b>No asignar pedidos nuevos</b><span>Seguirá visible hasta terminar sus entregas activas.</span></div>}
     <div className="actions">
      <b>Control operativo</b>
      {selected.suspended
       ? <><span>Motivo: {selected.suspensionReason||"No especificado"}</span><button onClick={reactivate}>Reactivar repartidor</button></>
       : <><input value={suspensionReason} onChange={e=>setSuspensionReason(e.target.value)} maxLength={160} placeholder="Motivo de suspensión"/><button disabled={!suspensionReason.trim()} onClick={suspend}>Suspender repartidor</button></>}
      <span>Los cambios quedan registrados en el expediente.</span>
     </div>
     {Array.isArray(selected.audit)&&selected.audit.length>0&&<div className="actions">
      <b>Últimos movimientos</b>
      {selected.audit.slice(-3).reverse().map((event,index)=><span key={index}>{event.type==="suspended"?"Suspendido":"Reactivado"} · {event.at||""}{event.reason?" · "+event.reason:""}</span>)}
     </div>}
    </div>
   </div>}
  </main>
 </div>;
}
