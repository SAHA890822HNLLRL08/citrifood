#!/usr/bin/env node
// Run after deploying: npm run smoke:pilot -- https://your-citrifood-domain
// Only probes public health and unauthorized access. Never uses real accounts.
const base=process.argv[2];
const requireDb=process.argv[3]==="--require-db";
if(process.argv.length>3&&!requireDb){console.error("Unknown option. Use --require-db for hosted pilot checks.");process.exit(2)}
if(!base){console.error("Usage: npm run smoke:pilot -- https://your-domain");process.exit(2)}
let origin;
try{
 const url=new URL(base);
 const local=url.protocol==="http:"&&["localhost","127.0.0.1"].includes(url.hostname);
 if(!(url.protocol==="https:"||local)||url.username||url.password||url.pathname!=="/"||url.search||url.hash)throw Error();
 origin=url.origin;
}catch{console.error("Provide an HTTPS origin, or http://127.0.0.1:3000 for local CI");process.exit(2)}
const checks=[
 {path:"/api/health",method:"GET",status:200,verify:data=>data.application==="CitriFood"&&data.readyForRealOrders===false},
 {path:"/api/orders",method:"GET",status:401},
 {path:"/api/restaurant/orders",method:"GET",status:401},
 {path:"/api/operations/orders",method:"GET",status:401},
 {path:"/api/operations/couriers",method:"GET",status:401},
 {path:"/api/courier/orders",method:"GET",status:401}
];
let failed=false;
for(const check of checks){
 try{
  const response=await fetch(origin+check.path,{method:check.method,signal:AbortSignal.timeout(10000),redirect:"error",cache:"no-store"});
  const body=await response.json();
  const okay=response.status===check.status&&(!check.verify||check.verify(body))&&(!requireDb||check.path!=="/api/health"||(body.databaseConfigured===true&&body.databaseReachable===true));
  console.log((okay?"PASS":"FAIL")+" "+check.path+" HTTP "+response.status);
  if(check.path==="/api/health")console.log("  Supabase configured: "+Boolean(body.databaseConfigured)+", reachable: "+Boolean(body.databaseReachable));
  if(!okay)failed=true;
 }catch(error){console.log("FAIL "+check.path+" "+error.name);failed=true}
}
try{
 const page=await fetch(origin+"/piloto",{signal:AbortSignal.timeout(10000),redirect:"error",cache:"no-store"});
 const html=await page.text();
 const okay=page.status===200&&html.includes("CitriFood")&&html.includes("piloto conectado");
 console.log((okay?"PASS":"FAIL")+" /piloto HTTP "+page.status);
 if(!okay)failed=true;
}catch(error){console.log("FAIL /piloto "+error.name);failed=true}
if(failed){console.error("Pilot smoke checks failed; do not treat deployment as verified.");process.exitCode=1}
else console.log("Pilot page, public API and anonymous access checks passed. Database migrations and authenticated multi-phone flow are NOT verified by this script.");
