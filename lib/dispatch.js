import {paymentEligibility} from "./wallet.js";
// CitriFood dispatch configuration and multi-order batching.
export const DISPATCH_CONFIG={
 acceptanceSeconds:25,
 maxActiveOrders:4,
 autoAcceptPriorityBonus:6,
 maxExtraPickupMinutes:8,
 maxExtraDeliveryMinutes:12,
 sameDirectionBonus:14,
 noResponsePenalty:0.75
};
const clamp=n=>Math.max(0,Math.min(1,n));
export const DEFAULT_WEIGHTS={distance:.34,onTime:.20,completion:.14,cancel:.12,rating:.10,incidents:.06,routeFit:.04};
export function courierScore(c,w=DEFAULT_WEIGHTS){
 const distance=clamp(1-(c.distanceKm/6)), onTime=clamp(c.onTimeRate), completion=clamp(c.completionRate);
 const noCancel=clamp(1-c.cancelRate), rating=clamp((c.rating||0)/5), clean=clamp(1-(c.validIncidents||0)*.12);
 const routeFit=clamp(c.routeFit||0);
 let score=100*(distance*w.distance+onTime*w.onTime+completion*w.completion+noCancel*w.cancel+rating*w.rating+clean*w.incidents+routeFit*w.routeFit);
 if(c.autoAccept)score+=DISPATCH_CONFIG.autoAcceptPriorityBonus;
 score+=noResponseAdjustment(c);
 return score;
}
export function isEligible(c){
 return c.online&&c.available&&c.documentsApproved&&!c.suspended&&(c.activeOrders||0)<DISPATCH_CONFIG.maxActiveOrders;
}
export function canBundle(c,order){
 if(!isEligible(c))return false;
 if((c.activeOrders||0)>=DISPATCH_CONFIG.maxActiveOrders)return false;
 if(order.extraPickupMinutes>DISPATCH_CONFIG.maxExtraPickupMinutes)return false;
 if(order.extraDeliveryMinutes>DISPATCH_CONFIG.maxExtraDeliveryMinutes)return false;
 return (order.routeFit||0)>=.65;
}
export function rankCouriers(couriers,weights){
 return couriers.filter(isEligible).map(c=>({...c,dispatchScore:+courierScore(c,weights).toFixed(1)}))
 .sort((a,b)=>b.dispatchScore-a.dispatchScore||a.distanceKm-b.distanceKm);
}
export function rankForOrder(couriers,order,weights){
 return rankCouriers(couriers.map(c=>({...c,routeFit:order.routeFitByCourier?.[c.id]??0})),weights)
 .filter(c=>(c.activeOrders||0)===0||canBundle(c,{...order,routeFit:c.routeFit}))
 .filter(c=>!order.paymentMethod||paymentEligibility(c.wallet||{amountToDepositCents:0},order).eligible);
}
export function dispatchDecision(couriers,order={},weights){
 const ranked=rankForOrder(couriers,order,weights);
 return {selected:ranked[0]||null,alternates:ranked.slice(1),acceptanceSeconds:DISPATCH_CONFIG.acceptanceSeconds,createdAt:new Date().toISOString()};
}

// Performance event: unanswered offers have a small, cumulative effect.
// It is deliberately much lighter than an explicit cancellation.
export function recordOfferOutcome(profile,outcome){
 const next={...profile,offers:(profile.offers||0)+1};
 if(outcome==="accepted") next.acceptedOffers=(profile.acceptedOffers||0)+1;
 if(outcome==="rejected") next.rejectedOffers=(profile.rejectedOffers||0)+1;
 if(outcome==="timeout") next.unansweredOffers=(profile.unansweredOffers||0)+1;
 next.responseRate=((next.offers-(next.unansweredOffers||0))/next.offers);
 return next;
}
export function noResponseAdjustment(profile){
 const offers=Math.max(profile.offers||0,1);
 const rate=(profile.unansweredOffers||0)/offers;
 return -(rate*DISPATCH_CONFIG.noResponsePenalty*10);
}
