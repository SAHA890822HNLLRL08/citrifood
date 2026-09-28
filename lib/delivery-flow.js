// CitriFood delivery handoff rules.
// Pure helpers so the same rules can be enforced by UI and server APIs.
export const DELIVERY_RULES={
 restaurantArrivalRadiusM:50,
 restaurantArrivalMaxAccuracyM:75,
 customerApproachRadiusM:100,
 customerHandoffRadiusM:15,
 absentSupportAfterMinutes:10,
 absentReleaseAfterMinutes:15,
 maxPinAttempts:5,
 requiredMessages:1,
 requiredCalls:2
};
export function canConfirmRestaurantArrival({distanceM,gpsAccuracyM}){
 return Number.isFinite(distanceM)&&distanceM<=DELIVERY_RULES.restaurantArrivalRadiusM&&
 Number.isFinite(gpsAccuracyM)&&gpsAccuracyM<=DELIVERY_RULES.restaurantArrivalMaxAccuracyM;
}
export function canReceiveOrder({restaurantReady,restaurantArrivalVerified}){
 return Boolean(restaurantReady&&restaurantArrivalVerified);
}
export function canStartCustomerHandoff({distanceM,pickedUp}){
 return Boolean(pickedUp&&Number.isFinite(distanceM)&&distanceM<=DELIVERY_RULES.customerHandoffRadiusM);
}
export function shouldNotifyCustomerApproach({distanceM,alreadyNotified}){
 return !alreadyNotified&&Number.isFinite(distanceM)&&distanceM<=DELIVERY_RULES.customerApproachRadiusM;
}
export function canEscalateAbsent({minutesWaiting=0,messages=0,calls=0}){
 return minutesWaiting>=DELIVERY_RULES.absentSupportAfterMinutes&&messages>=DELIVERY_RULES.requiredMessages&&calls>=DELIVERY_RULES.requiredCalls;
}
export function canReleaseAbsent({minutesWaiting=0,messages=0,calls=0,supportCaseOpened=false}){
 return minutesWaiting>=DELIVERY_RULES.absentReleaseAfterMinutes&&messages>=DELIVERY_RULES.requiredMessages&&calls>=DELIVERY_RULES.requiredCalls&&supportCaseOpened;
}
export function validateDeliveryPin(expected,input,attempts=0){
 if(attempts>=DELIVERY_RULES.maxPinAttempts)return {ok:false,locked:true};
 const clean=String(input??"").trim();
 const ok=/^\d{4}$/.test(clean)&&clean===String(expected);
 const nextAttempts=ok?attempts:attempts+1;
 return {ok,locked:!ok&&nextAttempts>=DELIVERY_RULES.maxPinAttempts,attempts:nextAttempts};
}
export function deliveryEventMessage(event){
 const messages={
  courier_arrived_restaurant:"Tu repartidor ya llegó al restaurante y está esperando tu pedido.",
  restaurant_ready:"Tu pedido está listo.",
  courier_picked_up:"Tu repartidor ya tiene tu pedido y va en camino a tu domicilio. Mantente atento.",
  courier_near_customer:"Tu repartidor está por llegar.",
  delivered:"Tu pedido fue entregado. ¡Buen provecho!"
 };
 return messages[event]||"";
}
