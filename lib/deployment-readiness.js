// Public deployment readiness: never expose credentials or their values.
export function deploymentReadiness(env=process.env){
 const url=env.SUPABASE_URL||env.NEXT_PUBLIC_SUPABASE_URL||"";
 const anon=env.SUPABASE_ANON_KEY||env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"";
 const service=env.SUPABASE_SERVICE_ROLE_KEY||"";
 let validUrl=false;
 try{const parsed=new URL(url);validUrl=parsed.protocol==="https:"&&Boolean(parsed.hostname)}catch{}
 return {databaseConfigured:validUrl&&Boolean(anon),serverCredentialConfigured:Boolean(service),connected:false,mode:"demo-local"};
}
