import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../app/restaurante/page.js",import.meta.url),"utf8");

test("linked Supabase restaurants replace demo restaurant choices",()=>{
 assert.match(source,/sharedMode\?sharedRestaurants:names/);
 assert.match(source,/setRestaurant\(sharedRestaurants\[0\]\)/);
});

test("shared restaurant cards show courier progress and timestamps",()=>{
 assert.match(source,/o\.progress\?\.label/);
 assert.match(source,/o\.arrived_restaurant_at/);
 assert.match(source,/o\.picked_up_at/);
 assert.match(source,/OPERACIÓN EN VIVO/);
});

test("browser-only order history becomes fallback in shared mode",()=>{
 assert.match(source,/!sharedMode&&<>/);
 assert.match(source,/Operación conectada/);
});
