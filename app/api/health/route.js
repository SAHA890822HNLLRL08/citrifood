import {checkOrderSchemaConnectivity} from "../../../lib/deployment-readiness.js";
export const dynamic="force-dynamic";
export async function GET(){
 const connection=await checkSupabaseConnectivity();
 const crossDeviceOrders=Boolean(connection.databaseReachable&&connection.schemaReachable);
 return Response.json({
  application:"CitriFood",
  mode:crossDeviceOrders?"pilot-connected":"demo-local",
  crossDeviceOrders,
  databaseConfigured:connection.databaseConfigured,
  databaseReachable:connection.databaseReachable,
  orderSchemaReachable:Boolean(connection.schemaReachable),
  readyForRealOrders:false,
  message:crossDeviceOrders
   ?"Piloto compartido disponible para cuentas autenticadas. Cobros reales siguen deshabilitados."
   :"MVP de demostración local mientras se completa la conexión compartida."
 },{headers:{"Cache-Control":"no-store"}});
}
