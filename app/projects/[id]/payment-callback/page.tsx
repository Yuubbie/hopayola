import Link from "next/link";
import { fundProjectFromPayment } from "@/lib/fund-project";

async function verifyAndFundProject(reference: string, projectId: string) {
  const res = await fetch(
    "https://api.paystack.co/transaction/verify/" + encodeURIComponent(reference),
    {
      headers: {
        Authorization: "Bearer " + process.env.PAYSTACK_SECRET_KEY,
      },
      cache: "no-store",
    }
  );

  const json = await res.json();

  if (!json.status || !json.data) {
    return false;
  }

  const paidProjectId = json.data.metadata?.project_id;
  if (!paidProjectId || paidProjectId !== projectId) {
    return false;
  }

  try {
    const result = await fundProjectFromPayment({
      projectId,
      reference,
      amountKobo: Number(json.data.amount),
      currency: String(json.data.currency || ""),
      status: String(json.data.status || ""),
    });
    return result.ok;
  } catch (err) {
    console.error("[payment callback] funding failed", err);
    return false;
  }
}

export default async function PaymentCallback({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reference?: string }>;
}) {
  const { id: projectId } = await params;
  const { reference } = await searchParams;

  let success = false;

  if (reference && /^[A-Za-z0-9_-]{8,100}$/.test(reference)) {
    success = await verifyAndFundProject(reference, projectId);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      {success ? (
        <>
          <h1 className="font-display text-3xl mb-4">Payment received</h1>
          <p className="text-ink/70 leading-relaxed mb-8">
            Payment received. Hopayola will schedule production and pay
            assigned artisans as subcontractors after each verified
            milestone.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-display text-3xl mb-4">
            We couldn&apos;t confirm your payment
          </h1>
          <p className="text-ink/70 leading-relaxed mb-8">
            If you completed payment, this may just be a delay -
            check your account in a few minutes. If the issue continues,
            contact support.
          </p>
        </>
      )}
      <Link
        href="/account"
        className="inline-block bg-royal text-paper px-6 py-3 rounded-full hover:bg-royal-deep transition-colors"
      >
        Back to your account
      </Link>
    </main>
  );
}