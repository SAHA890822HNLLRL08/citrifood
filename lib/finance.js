// CitriFood settlement and cancellation rules.
// Amounts are expressed in MXN. Production money movement must be executed by the payment provider.
export const FINANCE_RULES={
 restaurantCancellationPenalty:20,
 courierCutoffHour:0,
 settlementHour:2,
 restaurantPayoutMode:"immediate"
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

export function buildOrderLedger(order={}){
 const total=money(order.total);
 const restaurantShare=order.restaurantShare==null?null:money(order.restaurantShare);
 const courierEarning=order.courierEarning==null?null:money(order.courierEarning);
 const complete=restaurantShare!==null&&courierEarning!==null;
 return {orderId:order.id||null,paymentMethod:order.paymentMethod||null,customerTotal:total,restaurantShare,courierEarning,citriFoodGross:complete?money(total-restaurantShare-courierEarning):null,status:complete?"Calculado":"Pendiente de desglose"};
}
