import test from "node:test";
import assert from "node:assert/strict";
import {applyRestaurantAdjustments,calculateOrderEconomics,closeCourierDay,courierBasePay,restaurantCancellation,splitOrderLedger} from "../lib/finance.js";

test("restaurant cancellation after acceptance charges $20",()=>{
 const r=restaurantCancellation({accepted:true,attributableToRestaurant:true,restaurantShare:250});
 assert.equal(r.penalty,20);assert.equal(r.refundCustomer,true);
});
test("restaurant penalty is deducted from next payout",()=>{
 assert.deepEqual(applyRestaurantAdjustments({restaurantShare:250,pendingPenalties:20}),{gross:250,deduction:20,payout:230,remainingPenalty:0});
});
test("courier earnings first reduce cash wallet debt",()=>{
 assert.deepEqual(closeCourierDay({deliveryEarnings:800,cashCollected:1500,previousWalletDebt:0}),{earnings:800,cashCollected:1500,debtBefore:0,totalDebt:1500,appliedToWallet:800,courierPayout:0,debtAfter:700});
});
test("courier receives only excess after debt is cleared",()=>{
 assert.equal(closeCourierDay({deliveryEarnings:900,cashCollected:0,previousWalletDebt:680}).courierPayout,220);
});
test("order ledger keeps each share explicit",()=>{
 assert.deepEqual(splitOrderLedger({customerTotal:300,restaurantShare:220,courierEarning:35}),{customerTotal:300,restaurantShare:220,courierEarning:35,citriFoodGross:45});
});

test("base order uses 10% restaurant commission plus 49 delivery and 5 protection",()=>{const x=calculateOrderEconomics({foodSubtotal:300,distanceKm:5,courierOrderNumber:1});assert.equal(x.restaurantCommission,30);assert.equal(x.restaurantPayout,270);assert.equal(x.customerTotal,354);assert.equal(x.courierEarning,25);assert.equal(x.citriFoodGross,59)});
test("extra distance charges customer 7 and pays courier 5 per km",()=>{const x=calculateOrderEconomics({foodSubtotal:300,distanceKm:7,courierOrderNumber:1});assert.equal(x.extraKm,2);assert.equal(x.deliveryFee,63);assert.equal(x.courierEarning,35);assert.equal(x.customerTotal,368)});
test("courier tiers progress at orders 15, 21 and 36",()=>{assert.equal(courierBasePay(14),25);assert.equal(courierBasePay(15),30);assert.equal(courierBasePay(21),35);assert.equal(courierBasePay(36),40)});
