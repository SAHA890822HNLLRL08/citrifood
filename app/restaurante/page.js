"use client";
import {useEffect,useState} from "react";
import {loadMvp,subscribeOrders,updateOrder} from "../../lib/mvp-store.js";
import "./restaurant.css";
const names=["Tacos El Centro","Burger House","Pizza Norte","Sushi Mty"];
const seed=[{id:"CF-DEMO-1",restaurant:"Tacos El Centro",customer:"María (ejemplo)",items:"3 tacos + refresco",total:245,status:"Nuevo",demo:true},{id:"CF-DEMO-2",restaurant:"Tacos El Centro",customer:"José (ejemplo)",items:"1 pirata + papa",total:210,status:"Preparando",demo:true}];
export default function Restaurante(){
 const[restaurant,setRestaurant]=useState(names[0]);
 const[actual,setActual]=useState([]);
 const[examples,setExamples]=useState(seed);
 useEffect(()=>{const refresh=()=>setActual(loadMvp().orders);refresh();return subscribeOrders(refresh)},[]);
 const orders=[...actual.filter(o=>o.restaurant===restaurant),...examples.filter(o=>o.restaurant===restaurant)];
 const change=(o,status)=>{if(o.id.startsWith("CF-DEMO-"))setExamples(v=>v.map(x=>x.id===o.id?{...x,status}:x));else updateOrder(o.id,{status})};
 return <main className="restaurantDash"><header><div><b>Citri<span>Food</span></b><small>Portal del restaurante · Demostración</small></div><a href="/acceso">Cambiar perfil</a></header>
 <label className="restaurantPicker">Restaurante <select value={restaurant} onChange={e=>setRestaurant(e.target.value)}>{names.map(name=><option key={name} value={name}>{name}</option>)}</select></label>
 <section className="restaurantStats"><article><small>Nuevos</small><b>{orders.filter(x=>x.status==="Nuevo").length}</b></article><article><small>Preparando</small><b>{orders.filter(x=>x.status==="Preparando").length}</b></article><article><small>Listos</small><b>{orders.filter(x=>x.status==="Listo").length}</b></article></section>
 <h1>Pedidos de {restaurant}</h1><p>Pedidos creados en este navegador. Los identificados como ejemplo no son pedidos de clientes.</p>
 <section className="restaurantOrders">{orders.length===0&&<p>Sin pedidos por ahora. Puedes crear uno desde la pantalla del cliente.</p>}{orders.map(o=><article key={o.id}><div><small>{o.id}{o.id.startsWith("CF-DEMO-")?" · EJEMPLO":""}</small><h2>{o.customer}</h2><p>{Array.isArray(o.items)?o.items.map(x=>x.qty+" × "+x.name).join(", "):o.items}</p><b>$ {o.total}</b></div><span className="restaurantStatus">{o.status}</span><div className="restaurantActions">{o.status==="Nuevo"&&<><button onClick={()=>change(o,"Rechazado")}>Rechazar</button><button className="main" onClick={()=>change(o,"Preparando")}>Aceptar pedido</button></>}{o.status==="Preparando"&&<button className="main" onClick={()=>change(o,"Listo")}>Marcar listo</button>}{o.status==="Listo"&&<button className="main" onClick={()=>change(o,"Esperando repartidor")}>Entregar a repartidor</button>}</div></article>)}</section><a className="backOps" href="/operaciones">← Centro de operaciones</a></main>
}