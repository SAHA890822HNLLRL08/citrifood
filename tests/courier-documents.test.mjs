import test from "node:test";
import assert from "node:assert/strict";
import {courierDocumentsStatus,documentIsCurrent} from "../lib/courier-documents.js";
const now=new Date("2026-09-28T12:00:00Z");
test("verified document without expiry remains current",()=>assert.equal(documentIsCurrent({verified:true},{now}),true));
test("expired courier document is invalid",()=>assert.equal(documentIsCurrent({verified:true,expiresAt:"2026-09-27T23:59:59Z"},{now}),false));
test("future expiry is valid",()=>assert.equal(documentIsCurrent({verified:true,expiresAt:"2027-01-01T00:00:00Z"},{now}),true));
test("invalid expiry value fails closed",()=>assert.equal(documentIsCurrent({verified:true,expiresAt:"not-a-date"},{now}),false));
test("courier requires identity license and vehicle documents",()=>{
 const result=courierDocumentsStatus({identity:{verified:true},license:{verified:true,expiresAt:"2027-01-01T00:00:00Z"},vehicle:{verified:false}},{now});
 assert.equal(result.valid,false);assert.deepEqual(result.missing,["vehicle"]);
});
