"use client";
import {useState} from "react";
import "./courier.css";
const offers=[
{id:"CF-1052",restaurant:"Taco Chuy",pickup:"Centro",destination:"Infonavit",pay:"Tarjeta",earning:38,route:"+4 min",fit:96},
{id:"CF-1053",restaurant:"Sergio's Pizza",pickup:"Centro",destination:"Infonavit",pay:"Tarjeta",earning:42,route:"+6 min",fit:92},
{id:"CF-1054",restaurant:"Taco Lin",pickup:"Centro",destination:"Infonavit",pay:"Efectivo",total:120,earning:35,route:"+7 min",fit:89}
];
export default function Repartidor(){const[online,setOnline]=useState(true),[auto,setAuto]=useState(true),[active,setActive]=useState([offers[0]]),[offer,setOffer]=useState(offers[1]);
function accept(){if(active.length<4&&offer){setActive(v=>[...v,offer]);setOffer(offers.find(x=>!active.some(a=>a.id===x.id)&&x.id!==offer.id)||null)}}
return <main className="courier"><header><div><b>Citri<span>Food</span></b><small>Repartidor · Juan</small></div><button className={online?"online":"offline"} onClick={()=>setOnline(!online)}>{online?"● Conectado":"○ Desconectado"}</button></header>
<section className="top"><div><small>GANANCIAS HOY</small><h1>$312.00</h1><a href="/repartidor/cartera">Ver cartera →</a></div><label className="auto"><span><b>Aceptación automática</b><small>Prioridad adicional en pedidos compatibles</small></span><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/></label></section>
{offer&&<section className="offer"><div className="timer">25<small>seg</small></div><div><small>NUEVO PEDIDO · {offer.fit}% compatible con tu ruta</small><h2>{offer.restaurant}</h2><p>📍 {offer.pickup} → {offer.destination} · {offer.route}</p><p><b>Ganas ${offer.earning}</b> · {offer.pay}{offer.total?" · Cliente paga $"+offer.total:""}</p></div><div className="offerBtns"><button onClick={()=>setOffer(null)}>Rechazar</button><button onClick={accept}>Aceptar</button></div></section>}
<section><div className="routeHead"><div><small>RUTA ACTIVA</small><h2>{active.length} de 4 pedidos</h2></div><span>Optimizada automáticamente</span></div><div className="route">{active.map((x,i)=><article key={x.id}><i>{i+1}</i><div><b>{i===0?"Recoger":"Siguiente"} · {x.restaurant}</b><p>{x.pickup} → {x.destination}</p><small>{x.id} · {x.pay} · Ganancia ${x.earning}</small></div><button>Ver</button></article>)}</div></section>
<nav><button>🏠<small>Inicio</small></button><button>🗺️<small>Ruta</small></button><button>💰<small>Cartera</small></button><button>👤<small>Perfil</small></button></nav></main>}