import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { addMilestone, updateMilestoneStatus } from "./actions";
import PayProjectButton from "@/components/pay-project-button";
import { adminConfirmPayment, adminSendPayout } from "@/app/actions/project-flow";
import AdminManualPayoutForm from "@/components/admin-manual-payout-form";
import ProjectChat from "@/components/ProjectChat";
import { payoutBreakdown, ARTISAN_COMMISSION_RATE } from "@/lib/payments";
import ProjectSequence from "@/components/ProjectSequence";
import { signedProofUrl, withProofUrls } from "@/lib/milestone-proofs";

const MILESTONE_STATUS_OPTIONS = [
  "pending",
  "in_progress",
  "completed",
  "paid",
];

export default async function AdminProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/account");
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) {
    notFound();
  }

  const { data: clientProfile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", project.client_id)
    .single();

  const { data: team } = await supabase
    .from("project_team_members")
    .select("artisan_id, role_on_project, profiles(full_name)")
    .eq("project_id", id);

  const { data: rawMilestones } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("project_id", id)
    .order("milestone_order", { ascending: true });

  const milestones = await withProofUrls((rawMilestones || []) as any[]);
  const payoutProofHref = await signedProofUrl(project.payout_proof_path);

  const projectTotal = Number(
    project.funded_subtotal || project.budget_max || project.budget_min || 0
  );
  const paidMilestone = (milestones || []).find(
    (m: any) => m.status === "paid" || m.status === "paid_out"
  );
  const split = payoutBreakdown(projectTotal);

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/projects"
        className="text-sm text-royal hover:text-royal-deep mb-6 inline-block"
      >
        Back to all projects
      </Link>

      <h1 className="font-display text-3xl mb-2">
        {project.garment_type || "Project"}
        {project.occasion ? ` - ${project.occasion}` : ""}
      </h1>
      <p className="text-ink/60 mb-2">
        Client: {clientProfile?.full_name || "Unknown"}
        {clientProfile?.phone ? ` | ${clientProfile.phone}` : ""}
      </p>
      <p className="text-ink/60 mb-4 capitalize">
        {project.tier} package | {project.status.replace(/_/g, " ")} |{" "}
        {project.region}
      </p>
      {project.funded_at ? (
        <p className="text-sm text-green-700 mb-12">
          Client payment recorded {new Date(project.funded_at).toLocaleString("en-GB")}
        </p>
      ) : (
        <div className="mb-12">
          <p className="text-sm text-ink/60 mb-2">
            Client has not paid yet. The client pays the stage amounts
            exactly; the artisan receives each stage minus Hopayola&apos;s{" "}
            {Math.round(ARTISAN_COMMISSION_RATE * 100)}%.
          </p>

          {project.client_marked_paid_at && (
            <div className="border border-royal/30 bg-royal/5 rounded-xl p-4 mb-4">
              <p className="text-sm text-royal-deep">
                The client marked this as paid on{" "}
                {new Date(project.client_marked_paid_at).toLocaleString("en-GB")}.
              </p>
              {project.client_marked_paid_note && (
                <p className="text-xs text-ink/60 mt-1">
                  They said: {project.client_marked_paid_note}
                </p>
              )}
              <form action={adminConfirmPayment} className="mt-3">
                <input type="hidden" name="projectId" value={id} />
                <button
                  type="submit"
                  className="bg-royal text-paper rounded-lg px-4 py-1.5 text-sm hover:bg-royal-deep transition-colors"
                >
                  Payment received - unlock the work
                </button>
              </form>
              <p className="text-[11px] text-ink/50 mt-2">
                Only after you have seen the money. This starts the milestone
                clock and makes artisan payouts possible.
              </p>
            </div>
          )}

          <PayProjectButton projectId={id} />
        </div>
      )}

      {team && team.length > 0 && (
        <section className="border border-stone rounded-2xl p-6 mb-6">
          <h2 className="font-display text-lg mb-4">Team</h2>
          <ul className="text-sm space-y-1">
            {team.map((t: any) => (
              <li key={t.artisan_id}>
                {t.profiles?.full_name || "Unknown"} - {t.role_on_project}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border border-stone rounded-2xl p-6 mb-8">
        <h2 className="font-display text-lg mb-1">Artisan payout</h2>
        <p className="text-xs text-ink/50 mb-4">
          One payment, released only after the client confirms the finished
          outfit. Nothing is paid per stage.
        </p>

        <div className="grid grid-cols-3 gap-3 text-sm mb-4">
          <div>
            <p className="text-[11px] text-ink/45">Project total</p>
            <p>NGN {Math.round(split.gross).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[11px] text-ink/45">
              Hopayola {Math.round(ARTISAN_COMMISSION_RATE * 100)}%
            </p>
            <p>-NGN {Math.round(split.commission).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[11px] text-ink/45">Artisan receives</p>
            <p className="font-medium">
              NGN {Math.round(split.net).toLocaleString()}
            </p>
          </div>
        </div>

        {paidMilestone || project.payout_confirmed_at ? (
          <p className="text-sm text-green-700">
            Paid to the artisan
            {paidMilestone?.released_at
              ? ` on ${new Date(paidMilestone.released_at).toLocaleDateString("en-GB")}`
              : project.payout_confirmed_at
                ? ` on ${new Date(project.payout_confirmed_at).toLocaleDateString("en-GB")}`
                : ""}
            {paidMilestone?.paystack_transfer_reference
              ? ` · ${paidMilestone.paystack_transfer_reference}`
              : ""}
            {project.payout_confirmed_at ? " · artisan confirmed" : ""}
          </p>
        ) : !project.funded_at ? (
          <p className="text-sm text-ink/60">
            Waiting for the client&apos;s payment first.
          </p>
        ) : !project.client_received_at ? (
          <p className="text-sm text-ink/60">
            Held by Hopayola until the client marks the outfit received.
          </p>
        ) : (
          <>
            <p className="text-sm text-ink/70 mb-3">
              The client has the outfit. If the money is still in Paystack, send
              it from here. If it has already settled to OPay, pay from OPay and
              upload the receipt.
            </p>
            <form action={adminSendPayout}>
              <input type="hidden" name="projectId" value={id} />
              <button
                type="submit"
                className="bg-royal text-paper rounded-lg px-4 py-2 text-sm hover:bg-royal-deep transition-colors"
              >
                Send from Paystack
              </button>
            </form>
            {project.payout_proof_at && !project.payout_confirmed_at && (
              <div className="text-xs text-royal-deep mt-3">
                <p>
                  Receipt uploaded
                  {project.payout_proof_note
                    ? ` · ${project.payout_proof_note}`
                    : ""}
                  . Waiting for the artisan to confirm they received it.
                </p>
                {payoutProofHref && (
                  <a
                    href={payoutProofHref}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Open receipt
                  </a>
                )}
              </div>
            )}
            <AdminManualPayoutForm projectId={id} />
          </>
        )}
      </section>

      <section className="border border-stone rounded-2xl p-6">
        <h2 className="font-display text-lg mb-4">Milestones</h2>

        {!milestones || milestones.length === 0 ? (
          <p className="text-ink/50 text-sm mb-6">No milestones added yet.</p>
        ) : (
          <ul className="space-y-3 mb-6">
            {milestones.map((m) => (
              <li key={m.id} className="border border-stone rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="font-medium text-sm">
                      {m.milestone_name}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs border border-stone rounded-full px-2 py-1 text-ink/60">
                    {m.status === "paid" || m.status === "paid_out"
                      ? "Paid to artisan"
                      : m.payout_state === "pending" || m.payout_state === "claimed"
                        ? "Payout in progress"
                        : String(m.status || "").replace(/_/g, " ")}
                  </span>
                </div>

                <form
                  action={updateMilestoneStatus}
                  className="flex items-center gap-2"
                >
                  <input type="hidden" name="milestoneId" value={m.id} />
                  <input type="hidden" name="projectId" value={id} />
                  <select
                    key={`${m.id}-${m.status}`}
                    name="status"
                    defaultValue={m.status}
                    className="border border-stone rounded-lg px-3 py-1.5 text-sm"
                  >
                    {MILESTONE_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="bg-royal text-paper rounded-lg px-4 py-1.5 text-sm hover:bg-royal-deep transition-colors"
                  >
                    Update
                  </button>
                </form>
                {m.paystack_transfer_reference && (
                  <p className="text-[11px] text-ink/40 mt-2 break-all">
                    Transfer reference: {m.paystack_transfer_reference}
                  </p>
                )}
                {m.payout_error && m.status !== "paid" && (
                  <p className="text-[11px] text-amber-800 mt-2">
                    Last payout attempt: {m.payout_error}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        <form
          action={addMilestone}
          className="border-t border-stone pt-6 space-y-3"
        >
          <input type="hidden" name="projectId" value={id} />
          <div>
            <label
              className="block text-sm text-ink/50 mb-1"
              htmlFor="milestoneName"
            >
              New milestone name
            </label>
            <input
              id="milestoneName"
              name="milestoneName"
              type="text"
              required
              placeholder="Fabric confirmed, First fitting, Final delivery..."
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-ink/50 mb-1" htmlFor="amount">
              This artisan&apos;s share (NGN){" "}
              <span className="text-ink/30">
                — only for team projects; a single artisan is paid the project
                budget
              </span>
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0"
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-ink/50 mb-1" htmlFor="artisanId">
              Artisan for this milestone
            </label>
            <select
              id="artisanId"
              name="artisanId"
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm bg-paper"
            >
              <option value="">Same as claimed artisan</option>
              {(team || []).map((t: any) => (
                <option key={t.artisan_id} value={t.artisan_id}>
                  {t.profiles?.full_name ||
                    t.profiles?.[0]?.full_name ||
                    t.artisan_id}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-ink/40 mt-1">
              Premium / extra hands: pick another team artisan for this stage.
            </p>
          </div>
          <button
            type="submit"
            className="bg-royal text-paper rounded-lg px-4 py-2 text-sm hover:bg-royal-deep transition-colors"
          >
            Add milestone
          </button>
        </form>
      </section>

      <section className="border border-stone rounded-2xl p-6 mt-8">
        <h2 className="font-display text-lg mb-2">Sequence</h2>
        <ProjectSequence
          project={project}
          role="admin"
          milestones={milestones || []}
        />
      </section>

      <section className="border border-stone rounded-2xl p-6 mt-8">
        <h2 className="font-display text-lg mb-2">Coordinated chat</h2>
        <ProjectChat projectId={id} viewerRole="admin" />
      </section>
    </div>
  );
}
