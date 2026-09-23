import {supabaseConfig} from "../../../../lib/deployment-readiness.js";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
export async function POST(request){
 const config=supabaseConfig();
 if(!config)return Response.json({error:"La base de datos todavía no está configurada."},{status:503,headers});
 let body;
 try{body=await request.json()}catch{return Response.json({error:"Solicitud inválida."},{status:400,headers})}
 const email=typeof body?.email==="string"?body.email.trim().toLowerCase():"";
 if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return Response.json({error:"Correo inválido."},{status:400,headers});
 try{
  const response=await fetch(config.url+"/auth/v1/otp",{method:"POST",headers:{apikey:config.anon,"Content-Type":"application/json"},body:JSON.stringify({email,create_user:true}),signal:AbortSignal.timeout(7000),cache:"no-store",redirect:"error"});
  if(!response.ok)return Response.json({error:"No fue posible enviar el código. Revisa la configuración de correo y límites de Supabase."},{status:503,headers});
  return Response.json({message:"Si el correo puede recibir mensajes, revisa tu bandeja para iniciar sesión."},{headers});
 }catch{return Response.json({error:"No se pudo conectar con el servicio de acceso."},{status:503,headers})}
}
