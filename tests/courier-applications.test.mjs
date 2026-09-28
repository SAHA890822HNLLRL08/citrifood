import test from "node:test";
import assert from "node:assert/strict";
import {documentsComplete} from "../lib/courier-applications.js";

test("courier application requires all three document groups",()=>{
 assert.equal(documentsComplete({documents:{identity:true,license:true,vehicle:true}}),true);
 assert.equal(documentsComplete({documents:{identity:true,license:false,vehicle:true}}),false);
 assert.equal(documentsComplete({documents:{identity:true,license:true}}),false);
 assert.equal(documentsComplete({}),false);
});
