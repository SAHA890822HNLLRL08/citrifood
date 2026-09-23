import {deploymentReadiness} from "../../../lib/deployment-readiness.js";
export const dynamic="force-dynamic";
export function GET(){
 const state=deploymentReadiness();
 return Response.json({
  application:"CitriFood",
  mode:state.mode,
  crossDeviceOrders:false,
  databaseConfigured:state.databaseConfigured,
  // Credentials are never returned, even as partial values.
  readyForRealOrders:false,
  message:"MVP de demostración: sin pedidos sincronizados, pagos ni cuentas reales."
 },{headers:{"Cache-Control":"no-store"}});
}
