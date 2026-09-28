import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

for(const path of ["app/restaurante/page.js","app/restaurante/restaurant.css"]){
 test(path+" has no literal escaped newline tokens",()=>{
  const source=fs.readFileSync(new URL("../"+path,import.meta.url),"utf8");
  assert.equal(source.includes("\\\\n"),false,"Found literal \\\\n in "+path);
 });
}
