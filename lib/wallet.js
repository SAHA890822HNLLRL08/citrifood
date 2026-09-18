// CitriFood courier cash wallet ledger.
// Money is stored as integer cents to avoid floating-point accounting errors.
export const cents=n=>Math.round(Number(n)*100);
export const money=c=>+(c/100).toFixed(2);

export function settleCashOrder({orderId,cashCollectedCents,courierEarningCents}){
 if(cashCollectedCents<0||courierEarningCents<0) throw new Error("Invalid amount");
 const retained=Math.min(cashCollectedCents,courierEarningCents);
 return {
  orderId,
  type:"cash_order_settlement",
  cashCollectedCents,
  courierEarningCents,
  courierRetainedCents:retained,
  companyReceivableCents:cashCollectedCents-retained
 };
}

export function walletSummary(entries=[]){
 const cashCollected=entries.reduce((s,e)=>s+(e.cashCollectedCents||0),0);
 const earnings=entries.reduce((s,e)=>s+(e.courierEarningCents||0),0);
 const retained=entries.reduce((s,e)=>s+(e.courierRetainedCents||0),0);
 const deposits=entries.reduce((s,e)=>s+(e.depositCents||0),0);
 const adjustments=entries.reduce((s,e)=>s+(e.adjustmentCents||0),0);
 const amountToDeposit=Math.max(0,cashCollected-retained-deposits+adjustments);
 return {cashCollectedCents:cashCollected,earningsCents:earnings,retainedCents:retained,depositsCents:deposits,amountToDepositCents:amountToDeposit};
}

export function registerDeposit({reference,amountCents,proofUrl=null}){
 return {type:"deposit",reference,depositCents:amountCents,proofUrl,createdAt:new Date().toISOString(),status:"pending_verification"};
}