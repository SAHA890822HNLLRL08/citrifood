// CitriFood settlement and cancellation rules.
// Amounts are expressed in MXN. Production money movement must be executed by the payment provider.
export const FINANCE_RULES={
 restaurantCancellationPenalty:20,
 courierCutoffHour:0,
 settlementHour:2,
 restaurantPayoutMode:"immediate",
 baseDeliveryFee:49,
 protectionFee:5,
 includedDistanceKm:5,
 customerExtraKmFee:7,
 courierExtraKmPay:5
};
const money=n=>Math.round((Number(n)||0)*100)/100;
export function restaurantCancellation({accepted=false,attributableToRestaurant=false,restaurantShare=0}={}){
 const penalty=accepted&&attributableToRestaurant?FINANCE_RULES.restaurantCancellationPenalty:0;
 return {refundCustomer:accepted,penalty,nextRestaurantPayoutDeduction:penalty,restaurantShare:money(restaurantShare)};
}
export function applyRestaurantAdjustments({restaurantShare=0,pendingPenalties=0}={}){
 const gross=money(restaurantShare),deduction=Math.min(gross,Math.max(0,money(pendingPenalties)));
 return {gross,deduction,payout:money(gross-deduction),remainingPenalty:money(Math.max(0,pendingPenalties-deduction))};
}
export function closeCourierDay({deliveryEarnings=0,cashCollected=0,previousWalletDebt=0}={}){
 const earnings=Math.max(0,money(deliveryEarnings));
 const debtBefore=Math.max(0,money(previousWalletDebt));
 const cash=Math.max(0,money(cashCollected));
 const totalDebt=money(debtBefore+cash);
 const applied=Math.min(earnings,totalDebt);
 return {earnings,cashCollected:cash,debtBefore,totalDebt,appliedToWallet:money(applied),courierPayout:money(earnings-applied),debtAfter:money(totalDebt-applied)};
}
export function splitOrderLedger({customerTotal=0,restaurantShare=0,courierEarning=0}={}){
 const total=money(customerTotal),restaurant=money(restaurantShare),courier=money(courierEarning);
 return {customerTotal:total,restaurantShare:restaurant,courierEarning:courier,citriFoodGross:money(total-restaurant-courier)};
}

export function courierBasePay(orderNumber=1){
 const n=Math.max(1,Number(orderNumber)||1);
 if(n>=36)return 40;if(n>=21)return 35;if(n>=15)return 30;return 25;
}
export function calculateOrderEconomics({foodSubtotal=0,distanceKm=0,courierOrderNumber=1}={}){
 const food=Math.max(0,money(foodSubtotal));
 const extraKm=Math.max(0,money(distanceKm)-FINANCE_RULES.includedDistanceKm);
 const restaurantPayout=food;
 const extraDeliveryCharge=money(extraKm*FINANCE_RULES.customerExtraKmFee);
 const deliveryFee=money(FINANCE_RULES.baseDeliveryFee+extraDeliveryCharge);
 const customerTotal=money(food+deliveryFee+FINANCE_RULES.protectionFee);
 const courierEarning=money(courierBasePay(courierOrderNumber)+extraKm*FINANCE_RULES.courierExtraKmPay);
 const citriFoodGross=money(customerTotal-restaurantPayout-courierEarning);
 return {foodSubtotal:food,distanceKm:money(distanceKm),extraKm:money(extraKm),restaurantPayout,deliveryFee,protectionFee:FINANCE_RULES.protectionFee,customerTotal,courierEarning,citriFoodGross};
}
export function buildOrderLedger(order={}){
 const foodSubtotal=order.foodSubtotal??order.subtotal??order.itemsSubtotal;
 if(foodSubtotal==null)return {orderId:order.id||null,status:"Pendiente de subtotal"};
 return {orderId:order.id||null,paymentMethod:order.paymentMethod||null,...calculateOrderEconomics({foodSubtotal,distanceKm:order.distanceKm||0,courierOrderNumber:order.courierOrderNumber||1}),status:"Calculado"};
}
