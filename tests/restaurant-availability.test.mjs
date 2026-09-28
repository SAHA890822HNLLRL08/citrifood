import test from "node:test";
import assert from "node:assert/strict";
import {isWithinRestaurantSchedule,normalizeRestaurantSchedule} from "../lib/restaurant-availability.js";

const local=(day,hour,minute=0)=>{const d=new Date(2026,8,27+day, hour,minute,0,0);return d};

test("disabled schedule never blocks orders",()=>{assert.equal(isWithinRestaurantSchedule({enabled:false,open:"09:00",close:"18:00"},local(0,3)),true)});

test("same-day schedule opens and closes at configured times",()=>{
 const s={enabled:true,open:"09:00",close:"18:00",days:[0,1,2,3,4,5,6]};
 assert.equal(isWithinRestaurantSchedule(s,local(0,8,59)),false);
 assert.equal(isWithinRestaurantSchedule(s,local(0,9)),true);
 assert.equal(isWithinRestaurantSchedule(s,local(0,17,59)),true);
 assert.equal(isWithinRestaurantSchedule(s,local(0,18)),false);
});

test("overnight schedule remains open after midnight",()=>{
 const s={enabled:true,open:"18:00",close:"02:00",days:[0,1,2,3,4,5,6]};
 assert.equal(isWithinRestaurantSchedule(s,local(0,23)),true);
 assert.equal(isWithinRestaurantSchedule(s,local(1,1,30)),true);
 assert.equal(isWithinRestaurantSchedule(s,local(1,3)),false);
});

test("schedule respects selected weekdays",()=>{
 const monday=new Date(2026,8,28,12,0,0,0);
 const s={enabled:true,open:"09:00",close:"18:00",days:[1]};
 assert.equal(isWithinRestaurantSchedule(s,monday),true);
 const tuesday=new Date(2026,8,29,12,0,0,0);
 assert.equal(isWithinRestaurantSchedule(s,tuesday),false);
});

test("invalid schedule values fall back safely",()=>{
 const s=normalizeRestaurantSchedule({enabled:true,open:"99:00",close:"x",days:[8,-1]});
 assert.equal(s.open,"09:00");assert.equal(s.close,"23:00");assert.deepEqual(s.days,[0,1,2,3,4,5,6]);
});

test("explicit Sunday-only schedule remains Sunday-only",()=>{assert.deepEqual(normalizeRestaurantSchedule({enabled:true,open:"18:00",close:"02:00",days:[0]}).days,[0])});

test("overnight schedule uses the opening weekday after midnight",()=>{
 const sundayOnly={enabled:true,open:"18:00",close:"02:00",days:[0]};
 assert.equal(isWithinRestaurantSchedule(sundayOnly,{weekday:0,hour:23,minute:0}),true);
 assert.equal(isWithinRestaurantSchedule(sundayOnly,{weekday:1,hour:1,minute:0}),true);
 assert.equal(isWithinRestaurantSchedule(sundayOnly,{weekday:1,hour:3,minute:0}),false);
});
