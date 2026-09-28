import {NextResponse} from "next/server";
import {computeGoogleRoute} from "../../../lib/google-routes.js";
const validPoint=p=>p&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lng))&&Math.abs(Number(p.lat))<=90&&Math.abs(Number(p.lng))<=180;
export async function POST(request){
 try{
  const {origin,destination}=await request.json();
  if(!validPoint(origin)||!validPoint(destination))return NextResponse.json({error:"Coordenadas inválidas"},{status:400});
  const apiKey=process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if(!apiKey)return NextResponse.json({error:"Rutas no configuradas"},{status:503});
  const route=await computeGoogleRoute({origin,destination,apiKey});
  return NextResponse.json(route);
 }catch(error){
  console.error("CitriFood route calculation failed",error?.message);
  return NextResponse.json({error:"No fue posible calcular la ruta"},{status:502});
 }
}
