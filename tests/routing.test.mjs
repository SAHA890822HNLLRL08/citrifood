import test from "node:test";
import assert from "node:assert/strict";
import {computeGoogleRoute} from "../lib/google-routes.js";

test("Google Routes adapter returns normalized motorcycle route",async()=>{
 let request;
 const fetchImpl=async(url,options)=>{request={url,options};return {ok:true,json:async()=>({routes:[{distanceMeters:7340,duration:"901s"}]})}};
 const route=await computeGoogleRoute({origin:{lat:25.19,lng:-99.83},destination:{lat:25.21,lng:-99.86},apiKey:"test-key",fetchImpl});
 assert.equal(route.distanceKm,7.34);assert.equal(route.durationMinutes,16);assert.equal(route.provider,"google-routes");
 const body=JSON.parse(request.options.body);assert.equal(body.travelMode,"TWO_WHEELER");assert.equal(body.routingPreference,"TRAFFIC_AWARE");
 assert.equal(request.options.headers["X-Goog-FieldMask"],"routes.distanceMeters,routes.duration");
});
test("Google Routes adapter requires protected API key",async()=>{await assert.rejects(()=>computeGoogleRoute({origin:{lat:1,lng:1},destination:{lat:2,lng:2}}),/API key missing/)});
test("Google Routes adapter fails safely when no route exists",async()=>{const fetchImpl=async()=>({ok:true,json:async()=>({routes:[]})});await assert.rejects(()=>computeGoogleRoute({origin:{lat:1,lng:1},destination:{lat:2,lng:2},apiKey:"test",fetchImpl}),/no route/)});

import {calculateOrderEconomics} from "../lib/finance.js";
test("real route distance feeds delivery economics",()=>{const route={distanceKm:7.3,durationMinutes:18};const x=calculateOrderEconomics({foodSubtotal:300,distanceKm:route.distanceKm,courierOrderNumber:1});assert.equal(x.extraKm,2.3);assert.equal(x.deliveryFee,65.1);assert.equal(x.courierEarning,36.5);assert.equal(x.customerTotal,370.1)});
