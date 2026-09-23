import {checkSupabaseConnectivity} from "../../../lib/deployment-readiness.js";
export const dynamic="force-dynamic";
export async function GET(){
 const connection=await checkSupabaseConnectivity();
 return Response.json({
  application:"CitriFood",
  mode:"demo-local",
  crossDeviceOrders:false,
  databaseConfigured:connection.databaseConfigured,
  databaseReachable:connection.databaseReachable,
  // Reachable auth does not mean the schema, roles, orders or chat are ready.
  readyForRealOrders:false,
  message:"MVP de demostración: sin pedidos sincronizados, pagos ni cuentas reales."
 },{headers:{"Cache-Control":"no-store"}});
}
