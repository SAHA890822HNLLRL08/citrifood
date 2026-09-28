import test from "node:test";
import assert from "node:assert/strict";
import {DISPATCH_CONFIG,dispatchDecision,rankForOrder,recordOfferOutcome} from "../lib/dispatch.js";

const base={online:true,available:true,documentsApproved:true,suspended:false,endingShift:false,activeOrders:0,onTimeRate:.95,completionRate:.98,cancelRate:.02,rating:4.8,validIncidents:0,distanceKm:1};

test("dispatch uses a 25 second acceptance window",()=>{assert.equal(DISPATCH_CONFIG.acceptanceSeconds,25);assert.equal(dispatchDecision([{id:"a",...base}],{}).acceptanceSeconds,25)});

test("auto accept provides priority without bypassing eligibility",()=>{
 const ranked=rankForOrder([{id:"normal",...base,distanceKm:.8},{id:"auto",...base,distanceKm:1,autoAccept:true}],{});
 assert.equal(ranked[0].id,"auto");
 const blocked=rankForOrder([{id:"offline",...base,online:false,autoAccept:true}],{});
 assert.equal(blocked.length,0);
});

test("courier with four active orders cannot receive another",()=>{assert.equal(rankForOrder([{id:"full",...base,activeOrders:4}],{}).length,0)});

test("bundling requires compatible route and detour limits",()=>{
 const courier={id:"busy",...base,activeOrders:1};
 const ok=rankForOrder([courier],{routeFitByCourier:{busy:.8},extraPickupMinutes:5,extraDeliveryMinutes:8});
 assert.equal(ok.length,1);
 const bad=rankForOrder([courier],{routeFitByCourier:{busy:.5},extraPickupMinutes:5,extraDeliveryMinutes:8});
 assert.equal(bad.length,0);
});

test("timeouts are recorded as a light response penalty",()=>{
 let p={...base,offers:0,unansweredOffers:0};
 p=recordOfferOutcome(p,"timeout");
 assert.equal(p.offers,1);assert.equal(p.unansweredOffers,1);assert.equal(p.responseRate,0);
});

test("suspended courier is never eligible even when closest",()=>{
 const blocked={...base,id:"blocked",distanceKm:.1,suspended:true};
 const eligible={...base,id:"eligible",distanceKm:2};
 assert.equal(dispatchDecision([blocked,eligible],{}).selected.id,"eligible");
});
test("courier with pending documents is never eligible",()=>{
 const pending={...base,id:"pending",documentsApproved:false,distanceKm:.1};
 const eligible={...base,id:"eligible",distanceKm:2};
 assert.equal(dispatchDecision([pending,eligible],{}).selected.id,"eligible");
});

test("expired detailed documents block courier dispatch",()=>{
 const expired={...base,id:"expired",documentsApproved:true,documents:{
  identity:{verified:true},license:{verified:true,expiresAt:"2020-01-01T00:00:00Z"},vehicle:{verified:true}
 }};
 const eligible={...base,id:"eligible",distanceKm:2};
 assert.equal(dispatchDecision([expired,eligible],{}).selected.id,"eligible");
});
