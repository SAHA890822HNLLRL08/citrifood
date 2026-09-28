"use client";
import{useEffect,useState}from"react";
import"./signup.css";
import{addCourier,loadCouriers}from"../../../lib/courier-registry.js";
import{documentsComplete,loadApplications,subscribeApplications,updateApplication}from"../../../lib/courier-applications.js";
export default function Solicitudes(){
 const[rows,setRows]=useState([]),[notice,setNotice]=useState("");
 useEffect(()=>{const refresh=()=>setRows(loadApplications());refresh();return subscribeApplications(refresh)},[]);
 const reject=id=>{updateApplication(id,{status:"Rechazado",reviewedAt:new Date().toISOString()});setNotice("Solicitud rechazada.")};
 const approve=row=>{
  if(!documentsComplete(row)){setNotice("No se puede aprobar: faltan documentos por validar.");return}
  const existing=loadCouriers().find(c=>c.applicationId===row.id||c.phone===row.phone);
  if(existing){updateApplication(row.id,{status:"Aprobado",courierId:existing.id,reviewedAt:new Date().toISOString()});setNotice("La persona ya estaba registrada como repartidor.");return}
  const courier=addCourier({name:row.name,phone:row.phone,vehicle:row.vehicle,applicationId:row.id,documentsApproved:true});
  updateApplication(row.id,{status:"Aprobado",courierId:courier.id,reviewedAt:new Date().toISOString()});setNotice(row.name+" fue dado de alta como "+courier.id+".");
 };
 return <main className="requests"><header><a href="/operaciones">← Operaciones</a><b>CitriFood · Altas</b></header><h1>Solicitudes de repartidores</h1><p>Una solicitud solo puede aprobarse cuando identidad, licencia y vehículo estén validados. Al aprobar, CitriFood crea el repartidor en el padrón operativo.</p>{notice&&<p><b>{notice}</b></p>}{rows.map(x=>{const complete=documentsComplete(x);return <article key={x.id}><div><small>{x.id}</small><h2>{x.name}</h2><p>{x.phone} · {x.vehicle}</p><span>Identidad {x.documents?.identity?"✓":"✕"} · Licencia {x.documents?.license?"✓":"✕"} · Vehículo {x.documents?.vehicle?"✓":"✕"}</span>{x.courierId&&<p><b>Repartidor: {x.courierId}</b></p>}</div><strong>{x.status}</strong>{x.status==="Pendiente"&&<div className="requestBtns"><button onClick={()=>reject(x.id)}>Rechazar</button><button className="approve" disabled={!complete} onClick={()=>approve(x)}>Aprobar y dar de alta</button></div>}</article>})}</main>
}