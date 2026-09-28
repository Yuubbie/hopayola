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

export function paystackKeyMode(secret = process.env.PAYSTACK_SECRET_KEY || "") {
  if (secret.startsWith("sk_live_")) return "live" as const;
  if (secret.startsWith("sk_test_")) return "test" as const;
  return "unknown" as const;
}

export function assertPaystackReady() {
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not set.");
  const mode = paystackKeyMode(secret);
  if (mode === "unknown") {
    throw new Error("PAYSTACK_SECRET_KEY must start with sk_test_ or sk_live_.");
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const siteLooksProd =
    site.includes("hopayola.com") && !site.includes("localhost");
  if (siteLooksProd && mode === "test") {
    throw new Error(
      "Production site is using a Paystack test key. Set sk_live_ on the host."
    );
  }
}

export function milestonePayoutLabel(m: {
  status: string;
  confirmed_at?: string | null;
}) {
  if (m.status === "paid" || m.status === "paid_out") return "Paid to artisan";
  if (m.confirmed_at) return "Confirmed · payout pending";
  if (m.status === "completed") return "Submitted · awaiting client";
  return String(m.status).replace(/_/g, " ");
}
