// Read-only incident view for browser-local demo orders.
export function incidentRows(orders=[]){
 return orders.filter(o=>o&&typeof o.id==="string"&&!o.id.startsWith("CF-DEMO-")).flatMap(o=>{
  const history=Array.isArray(o.deliveryIssueHistory)&&o.deliveryIssueHistory.length?o.deliveryIssueHistory:o.deliveryIssue?[o.deliveryIssue]:[];
  return history.map((issue,index)=>({id:o.id+"-"+index,orderId:o.id,restaurant:o.restaurant||"Sin restaurante",courier:o.courier||"Sin asignar",description:issue.description||"",reportedAt:issue.reportedAt||"",resolvedAt:issue.resolvedAt||null,isCurrent:index===history.length-1&&Boolean(o.deliveryIssue),status:index===history.length-1&&o.deliveryIssue&&!o.deliveryIssue.resolvedAt?"Pendiente":issue.resolvedAt?"Atendida":"Sin resolver",orderStatus:o.status}));
 }).sort((a,b)=>b.reportedAt.localeCompare(a.reportedAt));
}
