import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

for(const path of ["app/restaurante/page.js","app/restaurante/restaurant.css"]){
 test(path+" has no literal escaped newline tokens",()=>{
  const source=fs.readFileSync(new URL("../"+path,import.meta.url),"utf8");
  assert.equal(source.includes("\\\\n"),false,"Found literal \\\\n in "+path);
 });
}

test("shared order screens use realtime with a 60 second fallback",()=>{
 const customer=fs.readFileSync(new URL("../app/page.js",import.meta.url),"utf8");
 const restaurant=fs.readFileSync(new URL("../app/restaurante/page.js",import.meta.url),"utf8");
 const courier=fs.readFileSync(new URL("../app/repartidor/page.js",import.meta.url),"utf8");
 const operations=fs.readFileSync(new URL("../app/operaciones/pedidos/page.js",import.meta.url),"utf8");
 for(const [name,source] of [["customer",customer],["restaurant",restaurant],["courier",courier],["operations",operations]]){
  assert.match(source,/subscribe(?:SharedOrders|RestaurantSharedOrders|CourierSharedOrders|OperationsSharedOrders)/,name+" must subscribe to shared order realtime updates");
  assert.match(source,/setInterval\([^,]+,60000\)/,name+" must keep only a 60 second recovery poll");
  assert.doesNotMatch(source,/setInterval\([^,]+,(?:8000|10000)\)/,name+" must not use the old 8-10 second polling loop");
 }
});

test("customer shared order API supports scoped single-order lookup",()=>{
 const client=fs.readFileSync(new URL("../lib/customer-shared-orders.js",import.meta.url),"utf8");
 const route=fs.readFileSync(new URL("../app/api/orders/route.js",import.meta.url),"utf8");
 const shared=fs.readFileSync(new URL("../lib/shared-orders.js",import.meta.url),"utf8");
 assert.match(client,/export async function fetchSharedCustomerOrder\(orderId\)/);
 assert.match(client,/\/api\/orders\?id=/);
 assert.match(route,/searchParams\.get\("id"\)/);
 assert.match(shared,/rpc\/cf_customer_order/);
 assert.match(shared,/p_order_id/);
 assert.match(shared,/Pedido inválido/);
});

test("customer cancellation refreshes only the cancelled shared order",()=>{
 const client=fs.readFileSync(new URL("../lib/customer-shared-orders.js",import.meta.url),"utf8");
 assert.match(client,/cf_customer_cancel_order/);
 assert.match(client,/fetchSharedCustomerOrder\(orderId\)/);
 assert.match(client,/\{ok:true,order:refreshed\.order\}/);
});
