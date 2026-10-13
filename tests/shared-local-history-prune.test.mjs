import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("legacy synced orders are pruned from the customer local history index",()=>{
 const source=fs.readFileSync(new URL("../lib/mvp-store.js",import.meta.url),"utf8");
 assert.match(source,/function pruneSyncedCustomerLocalOrderIndex\(orders\)/);
 assert.match(source,/order\?\.shared===true&&order\?\.sharedOrderId/);
 assert.match(source,/pruneSyncedCustomerLocalOrderIndex\(data\.orders\)/);
});
