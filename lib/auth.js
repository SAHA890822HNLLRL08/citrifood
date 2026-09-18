export const ROLES={CUSTOMER:"customer",COURIER:"courier",RESTAURANT:"restaurant",OPERATIONS:"operations"};
export const ROLE_HOME={customer:"/",courier:"/repartidor",restaurant:"/restaurante",operations:"/operaciones"};
export function canAccess(role,path){if(path.startsWith("/operaciones"))return role===ROLES.OPERATIONS;if(path.startsWith("/restaurante"))return role===ROLES.RESTAURANT||role===ROLES.OPERATIONS;if(path.startsWith("/repartidor"))return role===ROLES.COURIER||role===ROLES.OPERATIONS;return true}
