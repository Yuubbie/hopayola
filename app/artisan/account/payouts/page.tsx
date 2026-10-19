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
        .select(
          "id, garment_type, occasion, status, funded_at, funded_subtotal, budget_min, budget_max, client_received_at"
        )
        .in("id", projectIds)
    : { data: [] as any[] };

  const { data: milestones } = projectIds.length
    ? await service
        .from("project_milestones")
        .select(
          "id, project_id, artisan_id, amount, status, payout_state, payout_amount, released_at, paystack_transfer_reference"
        )
        .in("project_id", projectIds)
    : { data: [] as any[] };

  const all = (milestones || []) as any[];

  const rows = ((projects || []) as any[])
    .map((p) => {
      const mine = all.filter(
        (m) => m.project_id === p.id && (!m.artisan_id || artisanIds.includes(m.artisan_id))
      );
      const paid = mine.find(
        (m) =>
          m.status === "paid" ||
          m.status === "paid_out" ||
          m.payout_state === "success"
      );
      const share = mine.reduce((sum, m) => sum + Number(m.amount || 0), 0);
      const total = Number(
        p.funded_subtotal || p.budget_max || p.budget_min || 0
      );
      const gross = paid
        ? Number(paid.payout_amount) > 0
          ? Number(paid.payout_amount) / (1 - ARTISAN_COMMISSION_RATE)
          : Number(paid.amount || total)
        : share > 0
          ? share
          : total;

      const net = paid
        ? Number(paid.payout_amount) > 0
          ? Number(paid.payout_amount)
          : payoutBreakdown(gross).net
        : payoutBreakdown(gross).net;

      const state = paid
        ? "paid"
        : !p.funded_at
          ? "unfunded"
          : p.client_received_at
            ? "ready"
            : "held";

      return { project: p, paid, gross, net, state };
    })
    .sort((a, b) => {
      const rank: Record<string, number> = { paid: 0, ready: 1, held: 2, unfunded: 3 };
      const diff = rank[a.state] - rank[b.state];
      if (diff !== 0) return diff;
      return (
        new Date(b.paid?.released_at || b.project.created_at || 0).getTime() -
        new Date(a.paid?.released_at || a.project.created_at || 0).getTime()
      );
    });

  const paidTotal = rows
    .filter((r) => r.state === "paid")
    .reduce((sum, r) => sum + r.net, 0);
  const readyTotal = rows
    .filter((r) => r.state === "ready")
    .reduce((sum, r) => sum + r.net, 0);
  const heldTotal = rows
    .filter((r) => r.state === "held")
    .reduce((sum, r) => sum + r.net, 0);

  const commissionPercent = Math.round(ARTISAN_COMMISSION_RATE * 100);

  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl mb-1">Payouts</h1>
        <p className="text-sm text-ink/55">
          You are paid once per project, after the client confirms they have the
          finished outfit.
        </p>
      </header>

      {!artisanProfile?.paystack_recipient_code && (
        <div className="mb-8 border border-amber-300 bg-amber-50 rounded-2xl p-5">
          <p className="text-sm text-amber-900 font-medium mb-1">
            No payout account on file
          </p>
          <p className="text-sm text-amber-900/80 mb-3">
            Money cannot reach you until your bank details are saved and
            verified. Payouts will fail even after a client confirms delivery.
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
            {rows.filter((r) => r.state === "paid").length} project
            {rows.filter((r) => r.state === "paid").length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="border border-stone rounded-2xl p-5">
          <p className="text-xs text-ink/50 mb-2">Ready to be sent</p>
          <p className="font-display text-2xl">{ngn(readyTotal)}</p>
          <p className="text-[11px] text-ink/40">
            client has confirmed delivery
          </p>
        </div>
        <div className="border border-stone rounded-2xl p-5">
          <p className="text-xs text-ink/50 mb-2">Held by Hopayola</p>
          <p className="font-display text-2xl">{ngn(heldTotal)}</p>
          <p className="text-[11px] text-ink/40">until delivery is confirmed</p>
        </div>
      </div>

      <section className="border border-stone rounded-2xl p-5 mb-8 bg-stone/30">
        <h2 className="font-display text-lg mb-2">How the money works</h2>
        <ol className="text-sm text-ink/70 space-y-1.5">
          <li>1. The client pays the full project amount before work starts.</li>
          <li>2. Hopayola holds it — not you, and not the client.</li>
          <li>
            3. You work through the stages. Each stage photo is for review only;
            it does not release money.
          </li>
          <li>
            4. The client receives the outfit and confirms it. Then Hopayola
            sends you {100 - commissionPercent}% of the project and keeps{" "}
            {commissionPercent}%.
          </li>
        </ol>
        <p className="text-xs text-ink/50 mt-3">
          Payouts go to the bank account on your profile. If that account is
          wrong, the transfer fails — update it under My profile.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl mb-1">By project</h2>
        <p className="text-xs text-ink/50 mb-5">
          One payment per project. What it was worth, and what you received.
        </p>

        {rows.length === 0 ? (
          <p className="text-sm text-ink/50 border border-stone rounded-2xl p-8 text-center">
            No jobs yet. Once you claim a project, it appears here with what you
            will be paid.
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => {
              const p = row.project;
              const isPaid = row.state === "paid";
              const stateLabel =
                row.state === "paid"
                  ? "Paid"
                  : row.state === "ready"
                    ? "Delivery confirmed · payout pending"
                    : row.state === "held"
                      ? "Held by Hopayola"
                      : "Client has not paid yet";

              return (
                <li
                  key={p.id}
                  className="border border-stone rounded-2xl p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">
                        {p.garment_type || "Project"}
                        {p.occasion ? ` — ${p.occasion}` : ""}
                      </p>
                      <p className="text-[11px] text-ink/50">
                        {isPaid && row.paid?.released_at
                          ? `Paid ${formatDate(row.paid.released_at)}`
                          : isPaid
                            ? "Paid"
                            : "Not paid yet"}
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

                  <div className="grid grid-cols-3 gap-3 text-xs border-t border-stone pt-3">
                    <div>
                      <p className="text-ink/45 mb-0.5">Project</p>
                      <p className="text-ink/80">{ngn(row.gross)}</p>
                    </div>
                    <div>
                      <p className="text-ink/45 mb-0.5">
                        Hopayola {commissionPercent}%
                      </p>
                      <p className="text-ink/80">
                        -{ngn(row.gross - row.net)}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink/45 mb-0.5">You receive</p>
                      <p className="font-medium text-ink">{ngn(row.net)}</p>
                    </div>
                  </div>

                  {isPaid && row.paid?.paystack_transfer_reference && (
                    <p className="text-[11px] text-ink/40 mt-3 break-all">
                      Receipt reference: {row.paid.paystack_transfer_reference}
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
