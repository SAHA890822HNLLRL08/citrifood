"use client";
import {useEffect,useState} from "react";
import "./courier.css";
import OrderChat from "../../components/order-chat.js";
import {assignCourierToOrder,confirmCourierPickup,loadMvp,reportDeliveryIssue,resolveDispatchOffer,subscribeOrders,updateOrder} from "../../lib/mvp-store.js";
import {closeCourierDay} from "../../lib/finance.js";
import {getBrowserPosition,publicCoordinates} from "../../lib/customer-location.js";
import {haversineKm} from "../../lib/geo.js";
import {loadRestaurantLocation,restaurantLocationReady} from "../../lib/restaurant-location.js";
import {loadCouriers,subscribeCouriers,updateCourier} from "../../lib/courier-registry.js";
import {getActiveCourierId,setActiveCourierId,subscribeCourierSession} from "../../lib/courier-session.js";
export default function Repartidor(){const[couriers,setCouriers]=useState([]);const[courierId,setCourierId]=useState("");const[assigned,setAssigned]=useState([]);const[issueDrafts,setIssueDrafts]=useState({});const[issueEditing,setIssueEditing]=useState(null);const[deliveryPins,setDeliveryPins]=useState({});const[deliveryNotice,setDeliveryNotice]=useState({});const[online,setOnline]=useState(false),[draining,setDraining]=useState(false),[auto,setAuto]=useState(false),[seconds,setSeconds]=useState(25),[notice,setNotice]=useState("");
const courier=couriers.find(x=>x.id===courierId)||null;
const liveOffer=loadMvp().orders.find(o=>o.dispatchOffer?.courierId===courierId&&o.dispatchOffer?.status==="Ofrecido"&&["Listo","Esperando repartidor"].includes(o.status))||null;
useEffect(()=>{const refresh=()=>{const all=loadCouriers();setCouriers(all);const id=getActiveCourierId(all[0]?.id||"");setCourierId(id);const current=all.find(x=>x.id===id);if(current){setOnline(current.online===true);setDraining(current.endingShift===true);setAuto(current.autoAccept===true)}};refresh();const a=subscribeCouriers(refresh),b=subscribeCourierSession(refresh);return()=>{a();b()}},[]);
useEffect(()=>{const refresh=()=>setAssigned(loadMvp().orders.filter(o=>(o.courierId===courierId||(!o.courierId&&o.courier===courier?.name))&&["Esperando repartidor","En entrega"].includes(o.status)));refresh();return subscribeOrders(refresh)},[courierId,courier?.name]);
const inProgress=assigned.length;
const completedToday=loadMvp().orders.filter(o=>(o.courierId===courierId||(!o.courierId&&o.courier===courier?.name))&&o.status==="Entregado");
const realEarnings=completedToday.reduce((s,o)=>s+(Number(o.courierEarning)||0),0);
const realCash=completedToday.filter(o=>String(o.paymentMethod||"").toLowerCase().includes("efectivo")).reduce((s,o)=>s+Math.max(0,(Number(o.total)||0)-(Number(o.courierEarning)||0)),0);
const demoPreviousDebt=180;
const settlement=closeCourierDay({deliveryEarnings:realEarnings,cashCollected:realCash,previousWalletDebt:demoPreviousDebt});
useEffect(()=>{if(draining&&inProgress===0){setOnline(false);setDraining(false);if(courierId)updateCourier(courierId,{online:false,available:true,endingShift:false,status:"Desconectado",activeOrders:0});setNotice("Todos los pedidos fueron entregados. Ya estás desconectado.")}},[draining,inProgress,courierId]);
function accept(){if(!courier||!liveOffer||draining||!online||assigned.length>=4)return;resolveDispatchOffer(liveOffer.id,"accepted");const assignedOrder=assignCourierToOrder(liveOffer.id,{courierId:courier.id,courierName:courier.name,courierState:courier});if(!assignedOrder){setNotice("La oferta ya no puede asignarse. Actualizando disponibilidad.");setSeconds(25);return}updateCourier(courier.id,{activeOrders:Math.min(4,(courier.activeOrders||assigned.length)+1),status:"En entrega",offers:(courier.offers||0)+1});setNotice("Pedido "+liveOffer.id+" aceptado y asignado.");setSeconds(25)}
function reject(){if(!courier||!liveOffer)return;resolveDispatchOffer(liveOffer.id,"rejected");updateCourier(courier.id,{offers:(courier.offers||0)+1});setNotice("Pedido rechazado. Se registra como respuesta, no como cancelación.");setSeconds(25)}
async function arriveRestaurant(order){
 const target=loadRestaurantLocation(order.restaurant);
 if(!restaurantLocationReady(target)){setDeliveryNotice(v=>({...v,[order.id]:"El restaurante debe verificar su ubicación antes de validar tu llegada."}));return}
 try{
  setDeliveryNotice(v=>({...v,[order.id]:"Verificando llegada al restaurante…"}));
  const point=await getBrowserPosition({maxAccuracyM:100});
  const distanceKm=haversineKm(publicCoordinates(point),target);
  const distanceM=distanceKm===null?Infinity:distanceKm*1000;
  if(distanceM>200){setDeliveryNotice(v=>({...v,[order.id]:"Estás a "+Math.round(distanceM)+" m. El botón se bloquea fuera de 200 m."}));return}
  if(distanceM>50){setDeliveryNotice(v=>({...v,[order.id]:"Estás a "+Math.round(distanceM)+" m. Acércate a 50 m o menos para registrar llegada."}));return}
  const at=new Date().toISOString();
  updateOrder(order.id,{arrivedRestaurantAt:at,restaurantArrivalVerified:{distanceM:Math.round(distanceM),accuracyM:Math.round(point.accuracyM),verifiedAt:at},deliveryEvents:[...(order.deliveryEvents||[]),{type:"courier_arrived_restaurant",at,distanceM:Math.round(distanceM)}]});
  setDeliveryNotice(v=>({...v,[order.id]:"Llegada al restaurante confirmada. Restaurante y cliente ya pueden ver el evento."}))
 }catch(error){setDeliveryNotice(v=>({...v,[order.id]:error.message||"No fue posible verificar tu llegada."}))}
}
function confirmPickup(order){
 if(!order.arrivedRestaurantAt){setDeliveryNotice(v=>({...v,[order.id]:"Primero confirma que llegaste al restaurante."}));return}
 const updated=confirmCourierPickup(order.id);
 if(updated)setDeliveryNotice(v=>({...v,[order.id]:"Pedido recibido. El cliente ya puede ver que vas en camino."}))
}
async function arriveCustomer(order){
 if(!order.customerCoordinates){setDeliveryNotice(v=>({...v,[order.id]:"Este pedido no tiene ubicación GPS del cliente. Operaciones debe revisarlo."}));return}
 try{
  setDeliveryNotice(v=>({...v,[order.id]:"Verificando llegada al domicilio…"}));
  const point=await getBrowserPosition({maxAccuracyM:50});
  const distanceKm=haversineKm(publicCoordinates(point),order.customerCoordinates);
  const distanceM=distanceKm===null?Infinity:distanceKm*1000;
  if(distanceM>10){setDeliveryNotice(v=>({...v,[order.id]:"Estás a "+Math.round(distanceM)+" m del punto de entrega. Acércate a 10 m o menos."}));return}
  const at=new Date().toISOString();
  updateOrder(order.id,{arrivedCustomerAt:at,customerArrivalVerified:{distanceM:Math.round(distanceM),accuracyM:Math.round(point.accuracyM),verifiedAt:at},deliveryEvents:[...(order.deliveryEvents||[]),{type:"courier_arrived_customer",at,distanceM:Math.round(distanceM)}]});
  setDeliveryNotice(v=>({...v,[order.id]:"Llegada al domicilio confirmada. Ya puedes solicitar el PIN al cliente."}))
 }catch(error){setDeliveryNotice(v=>({...v,[order.id]:error.message||"No fue posible verificar la llegada al domicilio."}))}
}
async function confirmDelivery(order){
 if(order.supportReview?.status==="Pendiente"){setDeliveryNotice(v=>({...v,[order.id]:"Este pedido está en revisión de Soporte y no puede entregarse hasta que se resuelva."}));return}
 if(!order.arrivedCustomerAt){setDeliveryNotice(v=>({...v,[order.id]:"Primero confirma tu llegada al domicilio."}));return}
 if(order.deliveryIssue&&!order.deliveryIssue.resolvedAt){setDeliveryNotice(v=>({...v,[order.id]:"Primero debe resolverse la incidencia."}));return}
 if(!order.customerCoordinates){setDeliveryNotice(v=>({...v,[order.id]:"Este pedido no tiene ubicación GPS del cliente. Operaciones debe revisarlo."}));return}
 const pin=String(deliveryPins[order.id]||"").trim();
 if(pin!==String(order.deliveryPin||"")){setDeliveryNotice(v=>({...v,[order.id]:"PIN incorrecto. Solicita al cliente su código de 4 dígitos."}));return}
 try{
  setDeliveryNotice(v=>({...v,[order.id]:"Verificando ubicación de entrega…"}));
  const point=await getBrowserPosition({maxAccuracyM:50});
  const distanceKm=haversineKm(publicCoordinates(point),order.customerCoordinates);
  const distanceM=distanceKm===null?Infinity:distanceKm*1000;
  if(distanceM>10){setDeliveryNotice(v=>({...v,[order.id]:"Aún estás a "+Math.round(distanceM)+" m del punto de entrega. Acércate a 10 m o menos."}));return}
  const deliveredAt=new Date().toISOString();
  const updated=updateOrder(order.id,{status:"Entregado",deliveredAt,deliveryVerified:{distanceM:Math.round(distanceM),accuracyM:Math.round(point.accuracyM),pinVerified:true,verifiedAt:deliveredAt},deliveryEvents:[...(order.deliveryEvents||[]),{type:"delivery_verified",at:deliveredAt,distanceM:Math.round(distanceM),pinVerified:true}]});
  if(updated){const current=loadCouriers().find(x=>x.id===courierId);if(current){const remaining=Math.max(0,(current.activeOrders||1)-1);if(current.endingShift&&remaining===0)updateCourier(courierId,{activeOrders:0,online:false,available:true,endingShift:false,status:"Desconectado"});else updateCourier(courierId,{activeOrders:remaining,status:current.endingShift?"Terminando jornada":remaining>0?"En entrega":"Disponible"})}setDeliveryNotice(v=>({...v,[order.id]:"Entrega confirmada con GPS y PIN."}))}
 }catch(error){setDeliveryNotice(v=>({...v,[order.id]:error.message||"No fue posible verificar la ubicación."}))}
}
function recordNoResponse(order,kind){
 if(order.supportReview?.status==="Pendiente"){setDeliveryNotice(v=>({...v,[order.id]:"El caso ya fue liberado a Soporte. Espera la resolución."}));return}
 if(!order.arrivedCustomerAt){setDeliveryNotice(v=>({...v,[order.id]:"Primero confirma tu llegada al domicilio."}));return}
 const current=loadMvp().orders.find(x=>x.id===order.id)||order;
 const existing=current.noResponse||{startedAt:new Date().toISOString(),messages:0,calls:0};
 const next={...existing,messages:existing.messages+(kind==="message"?1:0),calls:existing.calls+(kind==="call"?1:0),lastAttemptAt:new Date().toISOString()};
 updateOrder(order.id,{noResponse:next});
 setDeliveryNotice(v=>({...v,[order.id]:kind==="message"?"Mensaje al cliente registrado.":"Llamada al cliente registrada."}));
}
function releaseNoResponse(order){
 if(order.supportReview?.status==="Pendiente"){setDeliveryNotice(v=>({...v,[order.id]:"Este pedido ya está en revisión de Soporte."}));return}
 const current=loadMvp().orders.find(x=>x.id===order.id)||order;
 const nr=current.noResponse;
 if(!nr||nr.messages<1||nr.calls<2){setDeliveryNotice(v=>({...v,[order.id]:"Requiere mínimo 1 mensaje y 2 llamadas antes de liberar."}));return}
 const elapsed=Date.now()-new Date(nr.startedAt).getTime();
 if(elapsed<10*60*1000){setDeliveryNotice(v=>({...v,[order.id]:"Aún no pasan 10 minutos desde el primer intento de contacto."}));return}
 const at=new Date().toISOString();
 updateOrder(order.id,{noResponse:{...nr,releasedAt:at},supportReview:{type:"customer_no_response",status:"Pendiente",createdAt:at}});
 setDeliveryNotice(v=>({...v,[order.id]:"Pedido liberado a revisión de soporte por cliente sin respuesta."}));
}
async function updateMyLocation(){if(!online||draining){setNotice("Conéctate para actualizar tu ubicación.");return}try{setNotice("Actualizando ubicación…");const point=await getBrowserPosition({maxAccuracyM:120});updateCourier(courierId,{location:{...publicCoordinates(point),accuracyM:point.accuracyM,updatedAt:new Date().toISOString()}});setNotice("Ubicación actualizada para la asignación de pedidos.")}catch(error){setNotice(error.message||"No fue posible actualizar la ubicación")}}
function toggleConnection(){if(!courierId)return;if(!online){setOnline(true);setDraining(false);updateCourier(courierId,{online:true,available:true,endingShift:false,status:"Disponible"});setNotice("Estás conectado y disponible para recibir pedidos.");return}if(inProgress>0){setDraining(true);updateCourier(courierId,{online:true,available:false,endingShift:true,status:"Terminando jornada",activeOrders:inProgress});setNotice("Ya no recibirás pedidos nuevos. Te desconectaremos automáticamente al terminar los pedidos en curso.");return}setOnline(false);setDraining(false);updateCourier(courierId,{online:false,available:true,endingShift:false,status:"Desconectado",activeOrders:0});setNotice("Te desconectaste correctamente.")}
useEffect(()=>{if(!liveOffer?.dispatchOffer?.expiresAt){setSeconds(25);return}const tick=()=>{const left=Math.max(0,Math.ceil((new Date(liveOffer.dispatchOffer.expiresAt).getTime()-Date.now())/1000));setSeconds(left);if(left===0){resolveDispatchOffer(liveOffer.id,"timeout");if(courier)updateCourier(courier.id,{offers:(courier.offers||0)+1,unansweredOffers:(courier.unansweredOffers||0)+1});setNotice("Oferta sin respuesta. Impacto mínimo acumulativo en desempeño.")}};tick();const t=setInterval(tick,1000);return()=>clearInterval(t)},[liveOffer?.id,liveOffer?.dispatchOffer?.expiresAt,courierId]);
useEffect(()=>{if(!liveOffer||!online||draining||!auto||assigned.length>=4)return;const t=setTimeout(()=>accept(),1200);return()=>clearTimeout(t)},[liveOffer?.id,online,draining,auto,assigned.length]);
return <main className="courier"><header><div><b>Citri<span>Food</span></b><small>Repartidor · {courier?.name||"Sin seleccionar"}</small><select value={courierId} onChange={e=>{setActiveCourierId(e.target.value);setCourierId(e.target.value)}}>{couriers.map(x=><option key={x.id} value={x.id}>{x.name} · {x.id}</option>)}</select></div><button className={online?(draining?"finishing":"online"):"offline"} onClick={toggleConnection}>{!online?"○ Desconectado":draining?"⏳ Dejar de recibir y desconectarse":"● Conectado"}</button></header>
{draining&&<div className="disconnectBanner"><b>Terminando jornada</b><span>No recibirás pedidos nuevos. Completa tus {inProgress} pedido{inProgress===1?"":"s"} en curso y CitriFood te desconectará automáticamente.</span></div>}
<section className="top"><div><small>GANANCIAS HOY</small><h1>$ {realEarnings.toFixed(2)}</h1><a href="/repartidor/cartera">Ver cartera →</a></div><label className="auto"><span><b>Aceptación automática</b><small>Prioridad adicional en pedidos compatibles</small></span><input type="checkbox" checked={auto} disabled={draining||!online} onChange={e=>{setAuto(e.target.checked);if(courierId)updateCourier(courierId,{autoAccept:e.target.checked})}}/></label></section>
{liveOffer&&online&&!draining&&<section className="offer"><div className="timer">{seconds}<small>seg</small></div><div><small>NUEVO PEDIDO · OFERTA REAL DEL MVP</small><h2>{liveOffer.restaurant}</h2><p>📍 Recoger en restaurante → {liveOffer.address||"Cliente"}</p><p><b>Ganas $ {Number(liveOffer.courierEarning||0).toFixed(2)}</b> · {liveOffer.paymentMethod||"Pago registrado"} · Total $ {Number(liveOffer.total||0).toFixed(2)}</p></div><div className="offerBtns"><button onClick={reject}>Rechazar</button><button onClick={accept}>Aceptar</button></div></section>}
{notice&&<p className="dispatchNotice">{notice}</p>}<p className="dispatchNotice"><button type="button" disabled={!online||draining} onClick={updateMyLocation}>📍 Actualizar mi ubicación para recibir pedidos cercanos</button></p><section className="courierSettlement"><div><small>CORTE NOCTURNO · PILOTO</small><h2>Depósito estimado $ {settlement.courierPayout.toFixed(2)}</h2></div><div className="courierSettlementGrid"><span>Ganancias <b>$ {settlement.earnings.toFixed(2)}</b></span><span>Efectivo + cartera <b>$ {settlement.totalDebt.toFixed(2)}</b></span><span>Aplicado a cartera <b>-$ {settlement.appliedToWallet.toFixed(2)}</b></span><span>Saldo pendiente <b>$ {settlement.debtAfter.toFixed(2)}</b></span></div><p>El corte se realiza al terminar el día y la dispersión se prepara alrededor de las 02:00. Calculado con los pedidos entregados en este navegador. Esta pantalla todavía no mueve dinero real.</p></section>{assigned.length>0&&<section className="route"><h2>📦 Pedidos asignados desde Operaciones (demo)</h2>{assigned.map(o=><article key={o.id}><div><b>{o.id} · {o.restaurant}</b><p>📍 {o.address}</p>{o.deliveryNotes&&<p className="courierNotes">📝 {o.deliveryNotes}</p>}<small>{o.paymentMethod} · Total $ {o.total}</small></div><div className="courierOrderActions">{o.status==="En entrega"&&<>{o.supportReview?.status==="Pendiente"?<div className="noResponseActions"><b>🆘 Pedido en revisión de Soporte</b><small>No intentes entregar ni registrar más contactos hasta que Soporte resuelva el caso.</small></div>:<>{!o.arrivedCustomerAt&&<button type="button" onClick={()=>arriveCustomer(o)}>📍 Llegué al domicilio</button>}{o.arrivedCustomerAt&&<><div className="noResponseActions"><small>Si el cliente no responde: registra mínimo 1 mensaje + 2 llamadas. La liberación se habilita después de 10 min.</small><button type="button" onClick={()=>recordNoResponse(o,"message")}>💬 Registrar mensaje</button><button type="button" onClick={()=>recordNoResponse(o,"call")}>📞 Registrar llamada</button><button type="button" onClick={()=>releaseNoResponse(o)}>🆘 Liberar a soporte</button></div><input inputMode="numeric" maxLength={4} value={deliveryPins[o.id]||""} onChange={e=>setDeliveryPins(v=>({...v,[o.id]:e.target.value.replace(/\D/g,"").slice(0,4)}))} placeholder="PIN 4 dígitos"/><button disabled={Boolean(o.deliveryIssue&&!o.deliveryIssue.resolvedAt)||(deliveryPins[o.id]||"").length!==4} onClick={()=>confirmDelivery(o)}>📍 Verificar GPS + entregar</button>{deliveryNotice[o.id]&&<small>{deliveryNotice[o.id]}</small>}</>}</>}</>}{o.status==="Esperando repartidor"&&<>{!o.arrivedRestaurantAt?<button onClick={()=>arriveRestaurant(o)}>📍 Llegué al restaurante</button>:<button onClick={()=>confirmPickup(o)}>📦 Recibí el pedido</button>}{deliveryNotice[o.id]&&<small>{deliveryNotice[o.id]}</small>}</>}<button type="button" disabled={Boolean(o.deliveryIssue&&!o.deliveryIssue.resolvedAt)} className="courierIssueButton" onClick={()=>setIssueEditing(v=>v===o.id?null:o.id)}>⚠️ Incidencia</button></div><div className="courierChat"><OrderChat order={o} role="Repartidor"/></div>{o.deliveryIssue&&!o.deliveryIssue.resolvedAt&&<p className="courierIssueAlert">Primero debe atenderse la incidencia para confirmar la entrega.</p>}{o.deliveryIssue&&<p className="courierIssueAlert"><b>Incidencia:</b> {o.deliveryIssue.description} · {o.deliveryIssue.resolvedAt?"Atendida por Operaciones":"Pendiente de Operaciones"}</p>}{issueEditing===o.id&&<form className="courierIssueForm" onSubmit={e=>{e.preventDefault();if(reportDeliveryIssue(o.id,issueDrafts[o.id])){setIssueEditing(null);setIssueDrafts(d=>({...d,[o.id]:""}))}}}><label>Describe el problema<textarea required maxLength={250} value={issueDrafts[o.id]||""} onChange={e=>setIssueDrafts(d=>({...d,[o.id]:e.target.value}))} placeholder="Ej. No encuentro el domicilio"/></label><button type="submit" disabled={!issueDrafts[o.id]?.trim()}>Enviar a Operaciones (demo)</button></form>}</article>)}</section>}<nav><button>🏠<small>Inicio</small></button><button>🗺️<small>Ruta</small></button><a href="/repartidor/cartera">💰<small>Cartera</small></a><a href="/repartidor/perfil">👤<small>Perfil</small></a></nav></main>}