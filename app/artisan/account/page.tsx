import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { claimProject } from "./actions";
import { artisanConfirmFabric } from "@/app/actions/project-flow";

const STATUS_LABELS: Record<string, string> = {
  submitted: "New brief",
  concepts_ready: "Designing",
  concept_selected: "Ready to match",
  artisan_assigned: "Team assigned",
  in_production: "In production",
  milestone_review: "Awaiting review",
  completed: "Completed",
  cancelled: "Cancelled",
};

const OPEN_STATUSES = ["submitted", "concepts_ready", "concept_selected"];

const CLAIM_MESSAGES: Record<string, string> = {
  ok: "Project claimed. It is now under your jobs.",
  already: "You have already claimed this project.",
  taken: "Another artisan has already claimed this one.",
  not_artisan: "Only artisan accounts can claim. Finish your artisan sign-up first.",
  missing: "That project no longer exists.",
  failed: "Could not claim just now. Please try again.",
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function FabricConfirm({ projectId }: { projectId: string }) {
  return (
    <form action={artisanConfirmFabric} className="mt-3">
      <input type="hidden" name="projectId" value={projectId} />
      <button
        type="submit"
        className="w-full bg-royal text-paper rounded-lg py-2 text-xs font-medium hover:bg-royal-deep transition-colors"
      >
        Fabric has arrived
      </button>
    </form>
  );
}

export const dynamic = "force-dynamic";

export default async function ArtisanAccount({
  searchParams,
}: {
  searchParams: Promise<{ claim?: string; welcome?: string }>;
}) {
  const { claim, welcome } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The layout guards this already; keep the page safe on its own too.
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: artisanProfile } = await supabase
    .from("artisan_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const service = createServiceClient();
  const email = (user.email || "").toLowerCase();

  const { data: emailProfiles } = email
    ? await service.from("profiles").select("id").ilike("email", email)
    : { data: [] as { id: string }[] };
  const artisanIds = Array.from(
    new Set([user.id, ...(emailProfiles || []).map((p) => p.id)])
  );

  const { data: teamRows } = await service
    .from("project_team_members")
    .select("project_id, artisan_id")
    .in("artisan_id", artisanIds);

  const assignedIds = Array.from(
    new Set((teamRows || []).map((a) => a.project_id).filter(Boolean))
  );

  const { data: assignedProjects } =
    assignedIds.length > 0
      ? await service.from("projects").select("*").in("id", assignedIds)
      : { data: [] as any[] };

  const jobs = ((assignedProjects || []) as any[]).sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );

  const { data: openProjects } = await service
    .from("projects")
    .select("*")
    .in("status", OPEN_STATUSES)
    .eq("region", artisanProfile?.region || "abuja")
    .order("created_at", { ascending: false });

  const { data: myMilestones } =
    assignedIds.length > 0
      ? await service
          .from("project_milestones")
          .select("*")
          .in("project_id", assignedIds)
          .order("milestone_order", { ascending: true })
      : { data: [] as any[] };

  const milestonesByProject = new Map<string, any[]>();
  for (const m of (myMilestones || []) as any[]) {
    const list = milestonesByProject.get(m.project_id) || [];
    list.push(m);
    milestonesByProject.set(m.project_id, list);
  }

  function workStarted(p: any) {
    return Boolean(p?.fabric_received_at && p?.funded_at);
  }

  function myMilestonesFor(projectId: string) {
    return (milestonesByProject.get(projectId) || []).filter(
      (m) => !m.artisan_id || m.artisan_id === user!.id
    );
  }

  // What the artisan owes next, and what they are waiting on.
  const toShoot: { milestone: any; project: any }[] = [];
  const withClient: { milestone: any; project: any }[] = [];
  const paidStages: { milestone: any; project: any }[] = [];

  for (const p of jobs) {
    for (const m of myMilestonesFor(p.id)) {
      if (m.status === "paid" || m.status === "paid_out") {
        paidStages.push({ milestone: m, project: p });
      } else if (m.submitted_at && !m.confirmed_at) {
        withClient.push({ milestone: m, project: p });
      } else if (!m.submitted_at && workStarted(p)) {
        toShoot.push({ milestone: m, project: p });
      }
    }
  }

  const fabricToConfirm = jobs.filter(
    (p) => p.fabric_sent_at && !p.fabric_received_at
  );
  const unpaid = jobs.filter((p) => p.fabric_received_at && !p.funded_at);

  const inProgress = jobs.filter(
    (p) => p.status !== "completed" && p.status !== "cancelled"
  );
  const completedJobs = jobs.filter((p) => p.status === "completed");

  type Job = { at: string; text: string };
  const events: Job[] = [];
  for (const p of jobs) {
    const label = `${p.garment_type || "Project"}${p.occasion ? ` - ${p.occasion}` : ""}`;
    if (p.fabric_received_at) {
      events.push({ at: p.fabric_received_at, text: `Fabric received for ${label}` });
    }
    if (p.funded_at) {
      events.push({ at: p.funded_at, text: `Client payment held for ${label}` });
    }
    for (const m of myMilestonesFor(p.id)) {
      const name = m.milestone_name || `Milestone ${m.milestone_order}`;
      if (m.submitted_at) {
        events.push({ at: m.submitted_at, text: `You submitted ${name} - ${label}` });
      }
      if (m.confirmed_at) {
        events.push({ at: m.confirmed_at, text: `Client approved ${name} - ${label}` });
      }
    }
  }
  events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const recent = events.slice(0, 6);

  const upcoming = inProgress
    .filter((p) => p.delivery_deadline)
    .sort(
      (a, b) =>
        new Date(a.delivery_deadline).getTime() -
        new Date(b.delivery_deadline).getTime()
    )
    .slice(0, 3);

  const stats = [
    { label: "Claimed jobs", value: jobs.length, hint: "all time" },
    { label: "In progress", value: inProgress.length, hint: "active now" },
    {
      label: "Awaiting your photo",
      value: toShoot.length,
      hint: toShoot.length === 1 ? "1 stage to send" : "stages to send",
    },
    {
      label: "Waiting on client",
      value: withClient.length,
      hint: withClient.length === 1 ? "1 stage in review" : "stages in review",
    },
  ];

  return (
    <div className="max-w-6xl">
      {welcome && (
        <div className="mb-6 border border-royal/20 bg-royal/5 rounded-2xl p-4 text-sm text-royal-deep">
          Welcome to Hopayola. Claim a job below when one matches your work.
        </div>
      )}

      {claim && (
        <p
          className={`mb-6 text-sm border rounded-2xl px-4 py-3 ${
            claim === "ok"
              ? "border-green-300 text-green-800 bg-green-50"
              : "border-stone text-ink/70"
          }`}
        >
          {CLAIM_MESSAGES[claim] || "Claim status unknown."}
        </p>
      )}

      <header className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl mb-1">
          {greeting()}, {(profile?.full_name || "there").split(" ")[0]}
        </h1>
        <p className="text-ink/55 text-sm">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
          {" · "}
          {inProgress.length === 0
            ? "No jobs on your bench right now"
            : `${inProgress.length} job${inProgress.length === 1 ? "" : "s"} on your bench`}
        </p>
        <p className="text-xs text-ink/50 mt-3 max-w-xl leading-relaxed">
          Hopayola sends shipping boxes. Use your own branded wrap inside if
          you want — the outer box must be Hopayola&apos;s, like Amazon.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="border border-stone rounded-2xl p-5">
            <p className="text-xs text-ink/50 mb-2">{s.label}</p>
            <p className="font-display text-3xl mb-1">{s.value}</p>
            <p className="text-[11px] text-ink/40">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="min-w-0">
          <section id="jobs" className="mb-10 scroll-mt-24">
            <h2 className="font-display text-xl mb-1">My jobs</h2>
            <p className="text-xs text-ink/50 mb-5">
              Everything you have claimed, newest first.
            </p>

            {jobs.length === 0 ? (
              <div className="border border-stone rounded-2xl p-8 text-center">
                <p className="text-ink/55 text-sm mb-4">
                  No claimed jobs yet. If Hope assigned you in admin, give it a
                  refresh.
                </p>
                <Link
                  href="#open"
                  className="inline-block bg-royal text-paper text-sm px-5 py-2.5 rounded-full hover:bg-royal-deep transition-colors"
                >
                  See open jobs
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {jobs.map((p) => {
                  const list = myMilestonesFor(p.id);
                  const doneCount = list.filter((m) => m.confirmed_at).length;
                  const percent =
                    list.length > 0
                      ? Math.round((doneCount / list.length) * 100)
                      : p.client_received_at
                        ? 100
                        : 0;
                  const started = workStarted(p);
                  const nextStage = list.find((m) => !m.confirmed_at);

                  return (
                    <article
                      key={p.id}
                      className="border border-stone rounded-2xl p-5 flex flex-col bg-paper"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="font-medium text-sm">
                          {p.garment_type || "Project"}
                          {p.occasion ? ` - ${p.occasion}` : ""}
                        </p>
                        <span className="shrink-0 text-[11px] border border-stone rounded-full px-2 py-1 text-ink/60">
                          {STATUS_LABELS[p.status] ?? p.status}
                        </span>
                      </div>
                      <p className="text-xs text-ink/50 capitalize mb-4">
                        {p.tier || "standard"} package
                        {p.delivery_deadline
                          ? ` | Due ${formatDate(p.delivery_deadline)}`
                          : ""}
                      </p>

                      <div className="mb-2 flex items-center justify-between text-[11px] text-ink/50">
                        <span>
                          {list.length > 0
                            ? `${doneCount} of ${list.length} stages approved`
                            : "Stages not set up yet"}
                        </span>
                        <span>{percent}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-stone mb-4 overflow-hidden">
                        <div
                          className="h-full bg-royal rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <p className="text-xs text-ink/55 mb-5">
                        {!p.fabric_sent_at
                          ? "Waiting for the client to send fabric"
                          : !p.fabric_received_at
                            ? "Fabric is on the way - confirm when it arrives"
                            : !p.funded_at
                              ? p.client_marked_paid_at
                                ? "Client says payment is made - Hopayola is confirming"
                                : "Waiting for the client to set up payment"
                              : nextStage
                                ? `Next: ${nextStage.milestone_name || `Milestone ${nextStage.milestone_order}`}`
                                : "All stages approved"}
                        {started ? "" : " · not started"}
                      </p>

                      {p.fabric_sent_at && !p.fabric_received_at && (
                        <FabricConfirm projectId={p.id} />
                      )}

                      <Link
                        href={`/artisan/account/jobs/${p.id}`}
                        className="mt-auto block text-center bg-royal text-paper rounded-lg py-2.5 text-sm hover:bg-royal-deep transition-colors"
                      >
                        Open job
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section id="open" className="mb-10 scroll-mt-24">
            <h2 className="font-display text-xl mb-1">Open projects near you</h2>
            <p className="text-xs text-ink/50 mb-5 capitalize">
              Matching your region: {artisanProfile?.region || "abuja"}
            </p>

            {!openProjects || openProjects.length === 0 ? (
              <p className="text-sm text-ink/50 border border-stone rounded-2xl p-8 text-center">
                Nothing open for matching right now. Check back soon.
              </p>
            ) : (
              <ul className="space-y-4">
                {openProjects.map((p) => (
                  <li
                    key={p.id}
                    className="border border-stone rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-sm">
                          {p.garment_type || "Project"}
                          {p.occasion ? ` - ${p.occasion}` : ""}
                        </span>
                        <span className="text-[11px] border border-stone rounded-full px-2 py-1 text-ink/60">
                          {STATUS_LABELS[p.status] ?? p.status}
                        </span>
                      </div>
                      <p className="text-xs text-ink/50 capitalize">
                        {p.tier} package
                        {p.delivery_deadline
                          ? ` | Due ${formatDate(p.delivery_deadline)}`
                          : ""}
                      </p>
                    </div>
                    <form action={claimProject}>
                      <input type="hidden" name="projectId" value={p.id} />
                      <button
                        type="submit"
                        className="bg-royal text-paper rounded-full px-5 py-2 text-sm hover:bg-royal-deep transition-colors"
                      >
                        Claim this project
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-stone rounded-2xl p-6">
            <h2 className="font-display text-xl mb-5">Recent activity</h2>
            {recent.length === 0 ? (
              <p className="text-sm text-ink/50">
                Your stage submissions and client approvals will show up here.
              </p>
            ) : (
              <ul className="space-y-4">
                {recent.map((e, i) => (
                  <li key={`${e.at}-${i}`} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-royal shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-ink/75">{e.text}</p>
                      <p className="text-[11px] text-ink/40">{formatDate(e.at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-stone rounded-2xl p-5">
            <h2 className="font-display text-lg mb-4">Needs your action</h2>
            {toShoot.length === 0 && fabricToConfirm.length === 0 ? (
              <p className="text-sm text-ink/50">
                Nothing waiting on you. Fabric confirmations and stage photos
                will appear here.
              </p>
            ) : (
              <ul className="space-y-3">
                {fabricToConfirm.map((p) => (
                  <li
                    key={`fabric-${p.id}`}
                    className="rounded-xl border border-stone p-3"
                  >
                    <Link
                      href={`/artisan/account/jobs/${p.id}`}
                      className="block text-sm text-ink/80 hover:text-royal"
                    >
                      Confirm fabric for {p.garment_type || "Project"}
                    </Link>
                    <span className="block text-[11px] text-ink/45 mt-0.5 mb-1">
                      The rider has it - confirm when it is in your hands.
                    </span>
                    <FabricConfirm projectId={p.id} />
                  </li>
                ))}
                {toShoot.slice(0, 4).map(({ milestone, project }) => (
                  <li key={milestone.id}>
                    <Link
                      href={`/artisan/account/jobs/${project.id}`}
                      className="block rounded-xl border border-stone p-3 hover:border-royal transition-colors"
                    >
                      <span className="block text-sm text-ink/80">
                        {milestone.milestone_name ||
                          `Milestone ${milestone.milestone_order}`}
                      </span>
                      <span className="block text-[11px] text-ink/45 mt-0.5">
                        {project.garment_type || "Project"}
                        {project.occasion ? ` - ${project.occasion}` : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-stone rounded-2xl p-5">
            <h2 className="font-display text-lg mb-4">Waiting on the client</h2>
            {withClient.length === 0 && unpaid.length === 0 ? (
              <p className="text-sm text-ink/50">Nothing held up on their side.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {unpaid.map((p) => (
                  <li key={`pay-${p.id}`} className="text-ink/70">
                    {p.client_marked_paid_at
                      ? `Client says paid, Hopayola confirming - ${p.garment_type || "Project"}`
                      : `Payment not set up - ${p.garment_type || "Project"}`}
                  </li>
                ))}
                {withClient.slice(0, 4).map(({ milestone, project }) => (
                  <li key={milestone.id} className="text-ink/70">
                    {(milestone.milestone_name ||
                      `Milestone ${milestone.milestone_order}`) +
                      " in review - " +
                      (project.garment_type || "Project")}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-stone rounded-2xl p-5">
            <h2 className="font-display text-lg mb-4">Payouts</h2>
            <p className="font-display text-3xl mb-1">{paidStages.length}</p>
            <p className="text-[11px] text-ink/45 mb-4">
              stage{paidStages.length === 1 ? "" : "s"} paid out
            </p>
            <p className="text-sm text-ink/55">
              You are paid per stage, once the client approves your photo.
            </p>
            <Link
              href="/artisan/account/payouts"
              className="inline-block mt-4 text-sm text-royal hover:text-royal-deep"
            >
              See payout history
            </Link>
          </section>

          <section className="border border-stone rounded-2xl p-5">
            <h2 className="font-display text-lg mb-4">Your profile</h2>
            <p className="text-sm text-ink/75 mb-1">
              {profile?.full_name || "Not set"}
            </p>
            <p className="text-[11px] text-ink/45 mb-4">
              {artisanProfile?.verified ? "Verified artisan" : "Verification pending"}
              {" · "}
              <span className="capitalize">
                {(artisanProfile?.availability_status || "unavailable").replace(
                  "_",
                  " "
                )}
              </span>
            </p>
            <p className="text-xs text-ink/55 mb-4">
              {(artisanProfile?.specialty || []).join(", ") || "No specialty set"}
            </p>
            <Link
              href="/artisan/account/edit"
              className="text-sm text-royal hover:text-royal-deep"
            >
              Edit my profile
            </Link>
          </section>

          <section className="border border-stone rounded-2xl p-5">
            <h2 className="font-display text-lg mb-4">Quick actions</h2>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="#open" className="text-royal hover:text-royal-deep">
                  Find a job to claim
                </Link>
              </li>
              <li>
                <Link
                  href="/artisan/account/edit"
                  className="text-royal hover:text-royal-deep"
                >
                  Update availability and skills
                </Link>
              </li>
              <li>
                <Link
                  href="/artisan/account/messages"
                  className="text-royal hover:text-royal-deep"
                >
                  Message a coordinator
                </Link>
              </li>
            </ul>
          </section>
        </aside>
      </div>

      {completedJobs.length > 0 && (
        <p className="mt-10 text-xs text-ink/40">
          {completedJobs.length} completed job
          {completedJobs.length === 1 ? "" : "s"} in your history.
        </p>
      )}
    </div>
  );
}
