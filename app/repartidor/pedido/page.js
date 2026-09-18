"use client";
import {useState} from "react";
import "./order.css";
const steps=[["assigned","Pedido aceptado"],["to_restaurant","Ir al restaurante"],["arrived","Llegué al restaurante"],["picked_up","Pedido recogido"],["to_customer","En camino al cliente"],["delivered","Entregado"]];
const clock=()=>new Date().toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"});
export default function Pedido(){
 const[i,setI]=useState(1);const[times,setTimes]=useState({assigned:clock()});
 const next=()=>{const n=Math.min(i+1,steps.length-1);setTimes(v=>({...v,[steps[n][0]]:clock()}));setI(n)};
 return <main className="orderRun"><header><a href="/repartidor">← Ruta</a><b>Citri<span>Food</span></b><small>CF-1052</small></header>
 <section className="place"><small>{i<3?"RECOGER EN":"ENTREGAR EN"}</small><h1>{i<3?"Taco Chuy":"Cliente · Infonavit"}</h1><p>{i<3?"Centro, Montemorelos":"Infonavit, Montemorelos"}</p><button>🧭 Abrir navegación</button></section>
 <section className="timeline">{steps.map((s,n)=><div className={n<i?"done":n===i?"current":""} key={s[0]}><i>{n<i?"✓":n+1}</i><span><b>{s[1]}</b><small>{times[s[0]]?"Registrado · "+times[s[0]]:n===i?"Paso actual":"Pendiente"}</small></span></div>)}</section>
 {i<steps.length-1?<button className="primary" onClick={next}>{i===1?"Ya llegué":i===2?"Confirmar recolección":i===3?"Iniciar entrega":i===4?"Confirmar entrega":"Continuar"}</button>:<section className="success"><h2>✓ Entrega completada</h2><p>Hora de entrega: {times.delivered}. La ganancia queda lista para conciliación en cartera.</p><a href="/repartidor">Volver a mi ruta</a></section>}
 <p className="audit">Esta versión de prueba registra las horas de cada etapa en la sesión. La ubicación GPS se conectará cuando integremos mapas y permisos del dispositivo.</p></main>
}