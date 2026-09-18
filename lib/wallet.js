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

export const CASH_DEBT_LIMIT_CENTS=cents(800);

// Card-order earnings are applied against cash owed first.
// Any excess becomes normal earnings payable to the courier.
export function applyDigitalOrderEarning({orderId,earningCents,currentCashDebtCents}){
 const debtReduction=Math.min(currentCashDebtCents,earningCents);
 return {
  orderId,type:"digital_order_earning",earningCents,
  debtReductionCents:debtReduction,
  courierCreditCents:earningCents-debtReduction,
  resultingCashDebtCents:Math.max(0,currentCashDebtCents-debtReduction)
 };
}

// Cash eligibility considers the FULL customer cash collection, not only courier earnings.
// Small overage is allowed only when the candidate order itself causes it.
export function cashOrderEligibility({currentCashDebtCents,orderCashTotalCents}){
 if(currentCashDebtCents>=CASH_DEBT_LIMIT_CENTS)
  return {eligible:false,reason:"cash_limit_reached",cardOnly:true};
 const projected=currentCashDebtCents+orderCashTotalCents;
 // Prefer orders that keep debt at/below limit. A narrow overage can happen
 // because the accepted order's exact settlement may finish above the threshold.
 const eligible=projected<=CASH_DEBT_LIMIT_CENTS;
 return {eligible,projectedCashDebtCents:projected,cardOnly:!eligible,
  reason:eligible?"within_cash_limit":"order_would_exceed_cash_limit"};
}

export function paymentEligibility(wallet,order){
 if(order.paymentMethod!=="cash")return {eligible:true,reason:"digital_payment"};
 return cashOrderEligibility({currentCashDebtCents:wallet.amountToDepositCents,orderCashTotalCents:order.totalCents});
}
