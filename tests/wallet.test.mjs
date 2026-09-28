import test from "node:test";
import assert from "node:assert/strict";
import {cents,settleCashOrder,walletSummary,applyDigitalOrderEarning,cashOrderEligibility,paymentEligibility,CASH_DEBT_LIMIT_CENTS} from "../lib/wallet.js";

test("cash order keeps courier earning and records company receivable",()=>{
 const x=settleCashOrder({orderId:"CF1",cashCollectedCents:cents(400),courierEarningCents:cents(35)});
 assert.equal(x.courierRetainedCents,cents(35));assert.equal(x.companyReceivableCents,cents(365));
});
test("wallet debt uses cash less retained earnings",()=>{
 const s=walletSummary([settleCashOrder({orderId:"CF1",cashCollectedCents:cents(400),courierEarningCents:cents(35)})]);
 assert.equal(s.amountToDepositCents,cents(365));
});
test("digital earning reduces cash debt before becoming payable",()=>{
 const x=applyDigitalOrderEarning({orderId:"CF2",earningCents:cents(200),currentCashDebtCents:cents(150)});
 assert.equal(x.debtReductionCents,cents(150));assert.equal(x.courierCreditCents,cents(50));assert.equal(x.resultingCashDebtCents,0);
});
test("courier at $800 debt cannot receive another cash order",()=>{
 const x=cashOrderEligibility({currentCashDebtCents:CASH_DEBT_LIMIT_CENTS,orderCashTotalCents:cents(100),courierEarningCents:cents(30)});
 assert.equal(x.eligible,false);assert.equal(x.cardOnly,true);
});
test("cash order is blocked when projected debt exceeds limit",()=>{
 const x=cashOrderEligibility({currentCashDebtCents:cents(750),orderCashTotalCents:cents(100),courierEarningCents:cents(20)});
 assert.equal(x.eligible,false);assert.equal(x.reason,"order_would_exceed_cash_limit");
});
test("digital orders remain eligible when cash limit is reached",()=>{
 const x=paymentEligibility({amountToDepositCents:CASH_DEBT_LIMIT_CENTS},{paymentMethod:"card",totalCents:cents(500),courierEarningCents:cents(40)});
 assert.equal(x.eligible,true);assert.equal(x.reason,"digital_payment");
});
