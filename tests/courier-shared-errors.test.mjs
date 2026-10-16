import test from "node:test";
import assert from "node:assert/strict";
import {mapCourierDeliveryError} from "../lib/courier-shared-orders.js";

test("shared courier delivery errors become actionable Spanish messages",()=>{
 assert.match(mapCourierDeliveryError("PIN temporarily locked"),/PIN bloqueado/);
 assert.match(mapCourierDeliveryError("Order unavailable or invalid PIN"),/PIN incorrecto/);
 assert.match(mapCourierDeliveryError("Courier is too far from restaurant"),/50 m/);
 assert.match(mapCourierDeliveryError("Courier is too far from customer"),/10 m/);
 assert.match(mapCourierDeliveryError("Invalid GPS position"),/GPS/);
 assert.match(mapCourierDeliveryError("Verified restaurant arrival required"),/llegada al restaurante/);
 assert.match(mapCourierDeliveryError("Cash exposure limit exceeded before pickup"),/límite de efectivo/);
 assert.match(mapCourierDeliveryError("Order unavailable or delivery verification incomplete"),/verificaciones/);
});

test("unknown delivery errors remain visible for diagnosis",()=>{
 assert.equal(mapCourierDeliveryError("Unexpected backend failure"),"Unexpected backend failure");
});
