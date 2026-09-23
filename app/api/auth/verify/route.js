import {supabaseConfig} from "../../../../lib/deployment-readiness.js";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
export async function POST(request){
 const config=supabaseConfig();
 if(!config)return Response.json({error:"La base de datos todavía no está configurada."},{status:503,headers});
 let body;
 try{body=await request.json()}catch{return Response.json({error:"Solicitud inválida."},{status:400,headers})}
 const email=typeof body?.email==="string"?body.email.trim().toLowerCase():"";
 const token=typeof body?.code==="string"?body.code.trim():"";
 if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^[0-9]{6,8}$/.test(token))return Response.json({error:"Revisa el correo y el código recibido."},{status:400,headers});
 try{
  const response=await fetch(config.url+"/auth/v1/verify",{method:"POST",headers:{apikey:config.anon,"Content-Type":"application/json"},body:JSON.stringify({email,token,type:"email"}),signal:AbortSignal.timeout(7000),cache:"no-store",redirect:"error"});
  if(!response.ok)return Response.json({error:"Código inválido o vencido."},{status:401,headers});
  const result=await response.json();
  if(typeof result?.access_token!=="string"||!result?.user?.id)return Response.json({error:"No se recibió una sesión válida."},{status:503,headers});
  return Response.json({accessToken:result.access_token,expiresIn:result.expires_in??null},{headers});
 }catch{return Response.json({error:"No se pudo validar el acceso."},{status:503,headers})}
}
