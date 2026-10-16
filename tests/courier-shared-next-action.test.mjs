import test from "node:test";
import assert from "node:assert/strict";
import {courierSharedOrderNextAction,normalizeCourierSharedOrders} from "../lib/courier-shared-orders.js";

test("courier shared flow exposes the correct next action",()=>{
 assert.equal(courierSharedOrderNextAction({status:"Esperando repartidor"}).step,"arrive_restaurant");
 assert.equal(courierSharedOrderNextAction({status:"Esperando repartidor",restaurant_arrival_verified:true}).step,"pickup");
 assert.equal(courierSharedOrderNextAction({status:"En entrega"}).step,"arrive_customer");
 assert.equal(courierSharedOrderNextAction({status:"En entrega",customer_arrival_verified:true}).step,"pin");
 assert.equal(courierSharedOrderNextAction({status:"Entregado"}).step,"done");
});

test("active shared courier orders are prioritized ahead of history",()=>{
 const orders=normalizeCourierSharedOrders([
  {id:"done",status:"Entregado",created_at:"2026-10-15T10:00:00Z"},
  {id:"delivery",status:"En entrega",created_at:"2026-10-15T11:00:00Z"},
  {id:"pickup",status:"Esperando repartidor",created_at:"2026-10-15T12:00:00Z"}
 ]);
 assert.deepEqual(orders.map(x=>x.id),["pickup","delivery","done"]);
});
