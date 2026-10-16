import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("restaurant shared orders expose courier progress without delivery secrets",()=>{
 const source=fs.readFileSync(new URL("../app/api/restaurant/orders/route.js",import.meta.url),"utf8");
 for(const field of ["ready_at","courier_id","arrived_restaurant_at","restaurant_arrival_verified","picked_up_at"]){
  assert.match(source,new RegExp(field));
 }
 assert.doesNotMatch(source,/delivery_pin|delivery_lat|delivery_lng|customer_id/);
});
