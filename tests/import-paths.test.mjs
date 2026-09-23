import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readdirSync,readFileSync,statSync} from "node:fs";
import {dirname,join,resolve} from "node:path";

const root=process.cwd();
const folders=["app","components","lib","tests"];
function sourceFiles(folder){
 if(!existsSync(folder))return [];
 return readdirSync(folder).flatMap(name=>{
  const file=join(folder,name);
  if(statSync(file).isDirectory())return sourceFiles(file);
  return /\.(?:js|jsx|mjs)$/.test(file)?[file]:[];
 });
}
test("every relative JavaScript import resolves to a tracked source file",()=>{
 const missing=[];
 for(const folder of folders)for(const file of sourceFiles(join(root,folder))){
  const source=readFileSync(file,"utf8");
  const imports=/(?:\bfrom\s*|\bimport\s*)["'](\.{1,2}\/[^"']+)["']/g;
  for(const match of source.matchAll(imports)){
   const destination=resolve(dirname(file),match[1]);
   if(![destination,destination+".js",destination+".jsx",destination+".mjs",join(destination,"index.js")].some(existsSync)){
    missing.push(file.slice(root.length+1)+": "+match[1]);
   }
  }
 }
 assert.deepEqual(missing,[],"Broken relative imports must fail tests before Next.js build");
});
