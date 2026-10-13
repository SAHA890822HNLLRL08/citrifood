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
