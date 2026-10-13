import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("synced customer orders are removed from the visible local order index",()=>{
 const source=fs.readFileSync(new URL("../lib/mvp-store.js",import.meta.url),"utf8");
 assert.match(source,/CUSTOMER_ORDERS_KEY="citrifood_customer_orders"/);
 assert.match(source,/function removeCustomerLocalOrderIndex\(id\)/);
 assert.match(source,/changes\.shared===true&&changes\.sharedOrderId/);
 assert.match(source,/removeCustomerLocalOrderIndex\(id\)/);
});
