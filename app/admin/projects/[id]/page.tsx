import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { addMilestone, updateMilestoneStatus } from "./actions";
import PayProjectButton from "@/components/pay-project-button";
import {
  adminCancelProject,
  adminConfirmPayment,
  adminSendPayout,
} from "@/app/actions/project-flow";
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

  const service = createServiceClient();
  const { data: team } = await service
    .from("project_team_members")
    .select("artisan_id, role_on_project")
    .eq("project_id", id);
  const teamIds = (team || []).map((t) => t.artisan_id).filter(Boolean);
  const { data: teamProfiles } =
    teamIds.length > 0
      ? await service
          .from("profiles")
          .select("id, full_name")
          .in("id", teamIds)
      : { data: [] as { id: string; full_name: string | null }[] };
  const teamName = new Map(
    (teamProfiles || []).map((p) => [p.id, p.full_name || "Artisan"])
  );

  const { data: rawMilestones } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("project_id", id)
    .order("milestone_order", { ascending: true });

  const milestones = await withProofUrls((rawMilestones || []) as any[]);
  const payoutProofHref = await signedProofUrl(project.payout_proof_path);

  let selectedLookUrl: string | null = null;
  if (project.selected_concept_id) {
    const { data: concept } = await supabase
      .from("ai_design_concepts")
      .select("image_url")
      .eq("id", project.selected_concept_id)
      .maybeSingle();
    selectedLookUrl = concept?.image_url || null;
  }

  const fabricHrefs: string[] = [];
  for (const path of (project.fabric_image_urls || []).slice(0, 4)) {
    const { data } = await supabase.storage
      .from("project-fabrics")
      .createSignedUrl(String(path), 3600);
    if (data?.signedUrl) fabricHrefs.push(data.signedUrl);
  }

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

      <section className="border border-stone rounded-2xl p-6 mb-8">
        <h2 className="font-display text-lg mb-4">Look and client uploads</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-ink/45 mb-2">Selected studio concept</p>
            {selectedLookUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedLookUrl}
                alt="Selected concept"
                className="w-full rounded-xl border border-stone"
              />
            ) : (
              <p className="text-sm text-ink/50">No concept selected yet.</p>
            )}
          </div>
          <div>
            <p className="text-xs text-ink/45 mb-2">Client uploads</p>
            {fabricHrefs.length === 0 ? (
              <p className="text-sm text-ink/50">No photos uploaded.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {fabricHrefs.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt="Client upload"
                    className="w-28 h-28 object-cover rounded-lg border border-stone"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {project.funded_at ? (
        <p className="text-sm text-green-700 mb-12">
          Client payment recorded {new Date(project.funded_at).toLocaleString("en-GB")}
        </p>
      ) : (
        <div className="mb-12">
          <p className="text-sm text-ink/60 mb-2">
            Client has not paid yet. They pay the project amount once. The
            artisan is paid {100 - Math.round(ARTISAN_COMMISSION_RATE * 100)}%
            after the client confirms the finished outfit — not per stage.
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

      <section className="border border-stone rounded-2xl p-6 mb-6">
        <h2 className="font-display text-lg mb-4">Artisan assigned</h2>
        {!team || team.length === 0 ? (
          <p className="text-sm text-ink/50">Not assigned yet.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {team.map((t) => (
              <li key={t.artisan_id}>
                {teamName.get(t.artisan_id) || "Artisan"}
                {t.role_on_project
                  ? ` - ${String(t.role_on_project).replace(/_/g, " ")}`
                  : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

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
                  {teamName.get(t.artisan_id) || t.artisan_id}
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

      {project.status !== "cancelled" && !project.client_received_at && (
        <section className="border border-red-200 rounded-2xl p-6 mt-8">
          <h2 className="font-display text-lg mb-2">Cancel this project</h2>
          {project.funded_at ? (
            <p className="text-sm text-ink/60 mb-4">
              The client has already paid. Cancelling here stops the job for
              everyone. Refund the money in Paystack yourself, then write how
              you handled it.
            </p>
          ) : (
            <p className="text-sm text-ink/60 mb-4">
              No money is held yet. Cancelling just closes the brief.
            </p>
          )}
          <form action={adminCancelProject} className="space-y-3">
            <input type="hidden" name="projectId" value={id} />
            <textarea
              name="note"
              required
              rows={3}
              placeholder={
                project.funded_at
                  ? "Why, and how the refund will be sent (Paystack refund, bank, etc.)"
                  : "Why this brief is closing"
              }
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="text-sm border border-red-700 text-red-700 rounded-full px-4 py-2 hover:bg-red-700 hover:text-paper transition-colors"
            >
              Cancel project
            </button>
          </form>
        </section>
      )}

      {project.status === "cancelled" && (
        <section className="border border-stone rounded-2xl p-6 mt-8">
          <h2 className="font-display text-lg mb-2">Cancelled</h2>
          <p className="text-sm text-ink/65">
            {project.cancelled_note || "This project is cancelled."}
            {project.cancelled_at
              ? ` · ${new Date(project.cancelled_at).toLocaleDateString("en-GB")}`
              : ""}
          </p>
        </section>
      )}
    </div>
  );
}
