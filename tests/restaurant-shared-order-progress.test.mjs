import test from "node:test";
import assert from "node:assert/strict";
import {normalizeRestaurantSharedOrders,restaurantSharedOrderProgress} from "../lib/restaurant-shared-orders.js";

test("restaurant shared progress reflects courier lifecycle",()=>{
 assert.deepEqual(restaurantSharedOrderProgress({status:"Listo"}),{
  ready:true,courierAssigned:false,courierArrived:false,pickedUp:false,label:"🛵 Buscando repartidor automáticamente…"
 });
 assert.equal(restaurantSharedOrderProgress({status:"Listo",courier_id:"courier-1"}).label,"🛵 Repartidor asignado · en camino al restaurante");
 assert.equal(restaurantSharedOrderProgress({status:"Listo",courier_id:"courier-1",restaurant_arrival_verified:true}).label,"📍 Repartidor en el restaurante");
 assert.equal(restaurantSharedOrderProgress({status:"En entrega",picked_up_at:"2026-10-15T20:00:00Z"}).label,"📦 Pedido recogido · en camino al cliente");
});

test("restaurant shared orders prioritize active workflow stages",()=>{
 const orders=normalizeRestaurantSharedOrders([
  {id:"3",status:"Entregado",created_at:"2026-10-15T20:00:00Z"},
  {id:"2",status:"Preparando",created_at:"2026-10-15T19:00:00Z"},
  {id:"1",status:"Nuevo",created_at:"2026-10-15T18:00:00Z"}
 ]);
 assert.deepEqual(orders.map(order=>order.id),["1","2","3"]);
 assert.equal(orders[1].progress.ready,false);
});
