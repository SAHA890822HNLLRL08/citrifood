import test from "node:test";import assert from "node:assert/strict";import {haversineKm,usablePosition} from "../lib/geo.js";
test("same point is zero km",()=>assert.equal(haversineKm({lat:25,lng:-99},{lat:25,lng:-99}),0));
test("invalid coordinates do not create a billable distance",()=>assert.equal(haversineKm(null,{lat:25,lng:-99}),null));
test("GPS with poor accuracy is rejected",()=>assert.equal(usablePosition({coords:{latitude:25,longitude:-99,accuracy:150}},100),null));
test("usable GPS position keeps coordinates and accuracy",()=>assert.deepEqual(usablePosition({coords:{latitude:25,longitude:-99,accuracy:25}},100),{lat:25,lng:-99,accuracyM:25}));
