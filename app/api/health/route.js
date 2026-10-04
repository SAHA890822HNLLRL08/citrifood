import {checkOrderSchemaConnectivity} from "../../../lib/deployment-readiness.js";
export const dynamic="force-dynamic";
export async function GET(){
 const connection=await checkOrderSchemaConnectivity();
 const crossDeviceOrders=Boolean(connection.databaseReachable&&connection.schemaReachable);
 const diagnostic=!connection.databaseConfigured?"configuration-missing":!connection.databaseReachable?"database-unreachable":!connection.schemaReachable?"schema-unreachable":"connected";
 return Response.json({
  application:"CitriFood",
  mode:crossDeviceOrders?"pilot-connected":"demo-local",
  crossDeviceOrders,
  databaseConfigured:connection.databaseConfigured,
  diagnostic,
  databaseReachable:connection.databaseReachable,
  orderSchemaReachable:Boolean(connection.schemaReachable),
  readyForRealOrders:false,
  message:crossDeviceOrders
   ?"Piloto compartido disponible para cuentas autenticadas. Cobros reales siguen deshabilitados."
    :diagnostic==="configuration-missing"?"Falta configurar Supabase en el entorno de despliegue.":diagnostic==="database-unreachable"?"Supabase está configurado, pero no responde desde el despliegue.":"Supabase responde, pero el esquema de pedidos no está disponible."
 },{headers:{"Cache-Control":"no-store"}});
}
