import test from "node:test";
import assert from "node:assert/strict";
import {requirementsFor,quickStartRequirements,isExpired,validateOnboarding,consentReceipt} from "../lib/onboarding.js";

test("customer onboarding never requires INE",()=>{
 const ids=requirementsFor("customer").map(x=>x.id);
 assert.equal(ids.includes("ine"),false);
 assert.equal(ids.includes("profile_selfie"),true);
});
test("restaurant quick start requires GPS and payout account but not tax profile",()=>{
 const ids=quickStartRequirements("restaurant").map(x=>x.id);
 assert.equal(ids.includes("gps_location"),true);
 assert.equal(ids.includes("payout_account"),true);
 assert.equal(ids.includes("tax_profile"),false);
});
test("courier requires identity, license, vehicle and insurance documents",()=>{
 const ids=requirementsFor("courier").filter(x=>x.required).map(x=>x.id);
 for(const id of ["ine","profile_selfie","license","vehicle_registration","vehicle_insurance","vehicle_photo"]) assert.equal(ids.includes(id),true);
});
test("expired critical courier document blocks onboarding",()=>{
 const records={};
 for(const r of requirementsFor("courier").filter(x=>x.required)) records[r.id]={completed:true,expiresAt:r.expiry?"2020-01-01":undefined};
 const result=validateOnboarding("courier",records);
 assert.equal(result.ok,false);
 assert.ok(result.expired.includes("ine"));
 assert.ok(result.expired.includes("vehicle_insurance"));
});
test("electronic consent receipt is versioned",()=>{
 const r=consentReceipt({userId:"U1",role:"courier",documentId:"privacy",version:"1.0"});
 assert.equal(r.userId,"U1");assert.equal(r.version,"1.0");assert.ok(r.acceptedAt);
});
