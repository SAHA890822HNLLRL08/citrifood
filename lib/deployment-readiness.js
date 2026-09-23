// Never return credentials, access tokens, provider response bodies or private URLs.
export function supabaseConfig(env=process.env){
 const raw=env.SUPABASE_URL||env.NEXT_PUBLIC_SUPABASE_URL||"";
 const anon=env.SUPABASE_ANON_KEY||env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"";
 try{
  const url=new URL(raw);
  if(url.protocol!=="https:"||url.username||url.password||url.search||url.hash||url.pathname!=="/"||!anon)return null;
  return {url:url.origin,anon};
 }catch{return null}
}
export function deploymentReadiness(env=process.env){
 return {databaseConfigured:Boolean(supabaseConfig(env)),connected:false,mode:"demo-local"};
}
export async function checkSupabaseConnectivity(env=process.env,fetcher=fetch){
 const config=supabaseConfig(env);
 if(!config)return {databaseConfigured:false,databaseReachable:false};
 try{
  const response=await fetcher(config.url+"/auth/v1/health",{
   method:"GET",
   headers:{apikey:config.anon},
   signal:AbortSignal.timeout(3500),
   cache:"no-store",
   redirect:"error"
  });
  return {databaseConfigured:true,databaseReachable:response.ok};
 }catch{return {databaseConfigured:true,databaseReachable:false}}
}
