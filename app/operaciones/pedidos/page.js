"use client";
import {useEffect,useState} from "react";
import {loadMvp,subscribeOrders,updateOrder} from "../../../lib/mvp-store.js";
import "./orders.css";
const seed=[{id:"CF-DEMO-3",restaurant:"Tacos El Centro",customer:"María (ejemplo)",courier:"Sin asignar",status:"Preparando",payment:"Efectivo",total:245,demo:true},{id:"CF-DEMO-4",restaurant:"Burger House",customer:"José (ejemplo)",courier:"Juan Pérez",status:"En entrega",payment:"Tarjeta",total:210,demo:true}];
const statuses=["Todos","Nuevo","Preparando","Listo","Esperando repartidor","En entrega","Entregado","Rechazado"];
export default function Pedidos(){
 const[filter,setFilter]=useState("Todos");
 const[actual,setActual]=useState([]);
 useEffect(()=>{const refresh=()=>setActual(loadMvp().orders);refresh();return subscribeOrders(refresh)},[]);
 const all=[...actual,...seed],rows=filter==="Todos"?all:all.filter(x=>x.status===filter);
 return <main className="ordersAdmin"><header><a href="/operaciones">← Operaciones</a><b>CitriFood · Pedidos</b></header><h1>Pedidos</h1><p>Pedidos del navegador y ejemplos identificados. Asignación manual de demostración.</p>
 <div className="filters">{statuses.map(x=><button className={filter===x?"on":""} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div>
 <section>{rows.length===0&&<p>No hay pedidos con este estado.</p>}{rows.map(x=><article key={x.id}><div><small>{x.id}{x.demo?" · EJEMPLO":""}</small><h2>{x.restaurant}</h2><p>{x.customer} · {x.paymentMethod||x.payment} · $ {x.total}</p></div><div><strong>{x.status}</strong><small>{x.courier||"Sin asignar"}</small>{!x.demo&&["Listo","Esperando repartidor"].includes(x.status)&&<button type="button" onClick={()=>updateOrder(x.id,{status:"En entrega",courier:"Juan Pérez (demo)"})}>Asignar a Juan (demo)</button>}</div></article>)}</section></main>
}