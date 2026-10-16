import test from "node:test";
import assert from "node:assert/strict";
import {courierSharedUiState} from "../lib/courier-shared-orders.js";

test("connected courier uses shared mode and exposes the next real action",()=>{
 const state=courierSharedUiState({
  courier:"Rosa",
  orders:[
   {id:"2",status:"En entrega",created_at:"2026-10-15T18:05:00Z",arrived_customer_at:null},
   {id:"1",status:"Esperando repartidor",created_at:"2026-10-15T18:00:00Z",restaurant_arrival_verified:true}
  ]
 });
 assert.equal(state.mode,"shared");
 assert.equal(state.connected,true);
 assert.equal(state.primaryOrder.id,"1");
 assert.equal(state.primaryAction.step,"pickup");
 assert.equal(state.active.length,2);
});

test("courier without shared account stays in demo fallback mode",()=>{
 const state=courierSharedUiState({courier:null,orders:[]});
 assert.equal(state.mode,"demo");
 assert.equal(state.connected,false);
 assert.equal(state.primaryOrder,null);
 assert.equal(state.primaryAction,null);
});
