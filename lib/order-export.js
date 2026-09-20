// CSV export for demo operations. Keep Excel/Sheets from interpreting user data as formulas.
export const ORDER_EXPORT_HEADERS=["Folio","Fecha","Restaurante","Cliente","Dirección","Estado","Pago","Total MXN","Envío MXN","Repartidor","Última actualización"];
export function csvCell(value){
 const str=String(value??"");
 const safe=/^[\s]*[=+@\-\t\r]/.test(str)?"'"+str:str;
 return '"'+safe.replaceAll('"','""')+'"';
}
export function ordersToCsv(orders){
 const rows=[ORDER_EXPORT_HEADERS,...orders.map(o=>[
  o.id,o.createdAt,o.restaurant,o.customer,o.address,o.status,o.paymentMethod||o.payment,
  Number.isFinite(Number(o.total))?Number(o.total).toFixed(2):"",
  Number.isFinite(Number(o.deliveryFee))&&o.deliveryFee!==undefined&&o.deliveryFee!==null?Number(o.deliveryFee).toFixed(2):"",
  o.courier,o.updatedAt||o.createdAt
 ])];
 return "\uFEFF"+rows.map(row=>row.map(csvCell).join(",")).join("\r\n")+"\r\n";
}
