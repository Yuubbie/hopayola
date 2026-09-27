export const CLIENT_SERVICE_FEE_RATE = 0.05;
export const ARTISAN_COMMISSION_RATE = 0.05;

export function clientCheckoutTotal(milestoneSubtotalNgn: number) {
  return milestoneSubtotalNgn * (1 + CLIENT_SERVICE_FEE_RATE);
}

export function artisanPayoutNgn(milestoneAmountNgn: number) {
  return milestoneAmountNgn * (1 - ARTISAN_COMMISSION_RATE);
}

export function toKobo(ngn: number) {
  return Math.round(ngn * 100);
}
