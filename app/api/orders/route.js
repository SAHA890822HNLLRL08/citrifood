import {customerOrdersRequest} from "../../../lib/shared-orders.js";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
function tokenFrom(request){const value=request.headers.get("authorization")||"";return /^Bearer [^\s]+$/i.test(value)?value.slice(7):""}
export async function GET(request){
 const result=await customerOrdersRequest("GET",tokenFrom(request),null);
 return Response.json(result.body,{status:result.status,headers});
}
export async function POST(request){
 let body;
 try{if(Number(request.headers.get("content-length")||0)>16384)throw Error("size");const text=await request.text();if(text.length>16384)throw Error("size");body=JSON.parse(text)}catch{return Response.json({error:"Solicitud de pedido inválida."},{status:400,headers})}
 const result=await customerOrdersRequest("POST",tokenFrom(request),body);
 return Response.json(result.body,{status:result.status,headers});
}
