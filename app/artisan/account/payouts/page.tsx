import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { payoutBreakdown, ARTISAN_COMMISSION_RATE } from "@/lib/payments";

export const metadata = { title: "Payouts — Hopayola" };
export const dynamic = "force-dynamic";

function ngn(value: number) {
  return `NGN ${Math.round(value).toLocaleString()}`;
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ArtisanPayoutsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const service = createServiceClient();
  const email = (user.email || "").toLowerCase();

  const { data: artisanProfile } = await service
    .from("artisan_profiles")
    .select("paystack_recipient_code")
    .eq("id", user.id)
    .maybeSingle();

  const { data: emailProfiles } = email
    ? await service.from("profiles").select("id").ilike("email", email)
    : { data: [] as { id: string }[] };

  const artisanIds = Array.from(
    new Set([user.id, ...(emailProfiles || []).map((p) => p.id)])
  );

  const { data: teamRows } = await service
    .from("project_team_members")
    .select("project_id")
    .in("artisan_id", artisanIds);

  const projectIds = Array.from(
    new Set((teamRows || []).map((t) => t.project_id).filter(Boolean))
  );

  const { data: projects } = projectIds.length
    ? await service
        .from("projects")
        .select("id, garment_type, occasion")
        .in("id", projectIds)
    : { data: [] as any[] };

  const { data: milestones } = projectIds.length
    ? await service
        .from("project_milestones")
        .select("*")
        .in("project_id", projectIds)
        .order("milestone_order", { ascending: true })
    : { data: [] as any[] };

  const projectMap = new Map((projects || []).map((p: any) => [p.id, p]));

  const mine = ((milestones || []) as any[]).filter(
    (m) => !m.artisan_id || artisanIds.includes(m.artisan_id)
  );

  const paid = mine.filter(
    (m) => m.status === "paid" || m.status === "paid_out" || m.payout_state === "success"
  );
  const inFlight = mine.filter(
    (m) =>
      m.payout_state === "pending" || m.payout_state === "claimed"
  );
  const awaitingClient = mine.filter(
    (m) => m.submitted_at && !m.confirmed_at
  );
  const approvedUnpaid = mine.filter(
    (m) =>
      m.confirmed_at &&
      !paid.includes(m) &&
      !inFlight.includes(m)
  );

  const netOf = (m: any) =>
    Number(m.payout_amount) > 0
      ? Number(m.payout_amount)
      : payoutBreakdown(Number(m.amount || 0)).net;

  const paidTotal = paid.reduce((sum, m) => sum + netOf(m), 0);
  const pendingTotal = [...approvedUnpaid, ...inFlight].reduce(
    (sum, m) => sum + netOf(m),
    0
  );

  const rows = [...mine].sort((a, b) => {
    const rank = (m: any) => {
      if (paid.includes(m)) return 0;
      if (inFlight.includes(m)) return 1;
      if (approvedUnpaid.includes(m)) return 2;
      if (awaitingClient.includes(m)) return 3;
      return 4;
    };
    const diff = rank(a) - rank(b);
    if (diff !== 0) return diff;
    return (
      new Date(b.released_at || b.confirmed_at || b.submitted_at || 0).getTime() -
      new Date(a.released_at || a.confirmed_at || a.submitted_at || 0).getTime()
    );
  });

  const commissionPercent = Math.round(ARTISAN_COMMISSION_RATE * 100);

  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl mb-1">Payouts</h1>
        <p className="text-sm text-ink/55">
          You are paid per stage, once the client approves the photo you send.
        </p>
      </header>

      {!artisanProfile?.paystack_recipient_code && (
        <div className="mb-8 border border-amber-300 bg-amber-50 rounded-2xl p-5">
          <p className="text-sm text-amber-900 font-medium mb-1">
            No payout account on file
          </p>
          <p className="text-sm text-amber-900/80 mb-3">
            Money cannot reach you until your bank details are saved and
            verified. Payouts will fail even after a client approves a stage.
          </p>
          <Link
            href="/artisan/account/edit"
            className="inline-block bg-royal text-paper text-sm px-4 py-2 rounded-full hover:bg-royal-deep transition-colors"
          >
            Add my bank details
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <div className="border border-stone rounded-2xl p-5">
          <p className="text-xs text-ink/50 mb-2">Paid to you</p>
          <p className="font-display text-2xl">{ngn(paidTotal)}</p>
          <p className="text-[11px] text-ink/40">
            {paid.length} stage{paid.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="border border-stone rounded-2xl p-5">
          <p className="text-xs text-ink/50 mb-2">On the way</p>
          <p className="font-display text-2xl">{ngn(pendingTotal)}</p>
          <p className="text-[11px] text-ink/40">
            {approvedUnpaid.length + inFlight.length} approved stage
            {approvedUnpaid.length + inFlight.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="border border-stone rounded-2xl p-5">
          <p className="text-xs text-ink/50 mb-2">Hopayola fee</p>
          <p className="font-display text-2xl">{commissionPercent}%</p>
          <p className="text-[11px] text-ink/40">
            of each stage, kept by Hopayola
          </p>
        </div>
      </div>

      <section className="border border-stone rounded-2xl p-5 mb-8 bg-stone/30">
        <h2 className="font-display text-lg mb-2">How the money works</h2>
        <ol className="text-sm text-ink/70 space-y-1.5">
          <li>
            1. The client pays Hopayola before the work starts. Hopayola holds
            the money.
          </li>
          <li>2. You send the photo for a stage.</li>
          <li>3. The client approves it.</li>
          <li>
            4. Hopayola sends you {100 - commissionPercent}% of that stage into
            your bank account, and keeps {commissionPercent}%.
          </li>
        </ol>
        <p className="text-xs text-ink/50 mt-3">
          Payouts go to the bank account on your profile, not to your Paystack
          account. If that account is wrong, the transfer fails — update it
          under My profile.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl mb-1">Stage by stage</h2>
        <p className="text-xs text-ink/50 mb-5">
          Every stage, what it was worth, and what you actually received.
        </p>

        {rows.length === 0 ? (
          <p className="text-sm text-ink/50 border border-stone rounded-2xl p-8 text-center">
            No stages yet. Once you claim a job and it is set up, your stages
            appear here with the amount you will be paid.
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((m: any) => {
              const project = projectMap.get(m.project_id);
              const breakdown = payoutBreakdown(Number(m.amount || 0));
              const isPaid = paid.includes(m);
              const isInFlight = inFlight.includes(m);
              const isApproved = approvedUnpaid.includes(m);
              const isAwaiting = awaitingClient.includes(m);
              const date =
                m.released_at || m.confirmed_at || m.submitted_at || null;

              const stateLabel = isPaid
                ? "Paid"
                : isInFlight
                  ? "Transfer in progress"
                  : isApproved
                    ? "Approved · payout pending"
                    : isAwaiting
                      ? "With client for review"
                      : "Not started";

              return (
                <li
                  key={m.id}
                  className="border border-stone rounded-2xl p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">
                        {m.milestone_name || `Milestone ${m.milestone_order}`}
                      </p>
                      <p className="text-[11px] text-ink/50">
                        {project
                          ? `${project.garment_type || "Project"}${project.occasion ? ` - ${project.occasion}` : ""}`
                          : "Project"}
                        {date ? ` · ${formatDate(date)}` : ""}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[11px] rounded-full px-3 py-1 ${
                        isPaid
                          ? "bg-royal text-paper"
                          : "border border-stone text-ink/60"
                      }`}
                    >
                      {stateLabel}
                    </span>
                  </div>

                  {Number(m.amount) > 0 ? (
                    <>
                      <div className="grid grid-cols-3 gap-3 text-xs border-t border-stone pt-3">
                        <div>
                          <p className="text-ink/45 mb-0.5">Stage</p>
                          <p className="text-ink/80">{ngn(breakdown.gross)}</p>
                        </div>
                        <div>
                          <p className="text-ink/45 mb-0.5">
                            Hopayola {commissionPercent}%
                          </p>
                          <p className="text-ink/80">
                            -{ngn(breakdown.commission)}
                          </p>
                        </div>
                        <div>
                          <p className="text-ink/45 mb-0.5">You receive</p>
                          <p className="font-medium text-ink">
                            {ngn(isPaid ? netOf(m) : breakdown.net)}
                          </p>
                        </div>
                      </div>

                      {isPaid && m.paystack_transfer_reference && (
                        <p className="text-[11px] text-ink/40 mt-3 break-all">
                          Receipt reference: {m.paystack_transfer_reference}
                        </p>
                      )}
                      {m.payout_error && !isPaid && (
                        <p className="text-[11px] text-amber-800 mt-3">
                          {m.payout_error}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-ink/50 border-t border-stone pt-3">
                      No amount set for this stage yet.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
