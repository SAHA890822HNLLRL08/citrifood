import test from "node:test";
import assert from "node:assert/strict";
import {
 DELIVERY_RULES,canConfirmRestaurantArrival,canReceiveOrder,
 isNearCustomer,canStartHandoff,canEscalateAbsent,canReleaseAbsent,
 verifyDeliveryPin
} from "../lib/delivery-flow.js";

test("restaurant arrival requires close distance and usable GPS",()=>{
 assert.equal(canConfirmRestaurantArrival({distanceM:45,accuracyM:20}),true);
 assert.equal(canConfirmRestaurantArrival({distanceM:80,accuracyM:20}),false);
 assert.equal(canConfirmRestaurantArrival({distanceM:45,accuracyM:100}),false);
});
test("courier can receive only after verified arrival and ready order",()=>{
 assert.equal(canReceiveOrder({arrived:true,restaurantReady:true}),true);
 assert.equal(canReceiveOrder({arrived:false,restaurantReady:true}),false);
});
test("customer approach and handoff use separate radiuses",()=>{
 assert.equal(isNearCustomer(95),true);
 assert.equal(canStartHandoff(95),false);
 assert.equal(canStartHandoff(12),true);
});
test("absent support accepts one message OR two calls after 10 minutes",()=>{
 assert.equal(canEscalateAbsent({minutesWaiting:10,messages:1,calls:0}),true);
 assert.equal(canEscalateAbsent({minutesWaiting:10,messages:0,calls:2}),true);
 assert.equal(canEscalateAbsent({minutesWaiting:10,messages:0,calls:1}),false);
});
test("absent release needs 15 minutes, contact evidence and support case",()=>{
 assert.equal(canReleaseAbsent({minutesWaiting:15,messages:1,calls:0,supportCaseOpened:true}),true);
 assert.equal(canReleaseAbsent({minutesWaiting:15,messages:0,calls:2,supportCaseOpened:true}),true);
 assert.equal(canReleaseAbsent({minutesWaiting:15,messages:1,calls:0,supportCaseOpened:false}),false);
});
test("PIN verification locks after configured failed attempts",()=>{
 const ok=verifyDeliveryPin({expected:"4827",entered:"4827",attempts:0});
 assert.equal(ok.ok,true);
 const bad=verifyDeliveryPin({expected:"4827",entered:"1111",attempts:DELIVERY_RULES.maxPinAttempts-1});
 assert.equal(bad.ok,false);
 assert.equal(bad.locked,true);
});
