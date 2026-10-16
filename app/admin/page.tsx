import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "New brief",
  concepts_ready: "Designing",
  concept_selected: "Ready to match",
  artisan_assigned: "Team assigned",
  in_production: "In production",
  milestone_review: "Awaiting review",
  completed: "Completed",
  cancelled: "Cancelled",
};

const OPEN_STATUSES = [
  "submitted",
  "concepts_ready",
  "concept_selected",
  "artisan_assigned",
  "in_production",
  "milestone_review",
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function projectLabel(p: any) {
  return `${p.garment_type || "Project"}${p.occasion ? ` - ${p.occasion}` : ""}`;
}

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const supabase = await createClient();

  const { data: projectRows } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const projects = (projectRows || []) as any[];

  const clientIds = [...new Set(projects.map((p) => p.client_id))].filter(
    Boolean
  );
  const { data: clientProfiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", clientIds.length > 0 ? clientIds : ["none"]);
  const clientMap = new Map(
    (clientProfiles || []).map((c) => [c.id, c.full_name])
  );

  const { data: awaitingReview } = await supabase
    .from("project_milestones")
    .select("id, project_id, milestone_name, milestone_order, submitted_at")
    .not("submitted_at", "is", null)
    .is("confirmed_at", null)
    .order("submitted_at", { ascending: true });

  const { data: readyToPay } = await supabase
    .from("project_milestones")
    .select("id, project_id, milestone_name, milestone_order, confirmed_at, amount")
    .not("confirmed_at", "is", null)
    .not("status", "in", "(paid,paid_out)")
    .order("confirmed_at", { ascending: true });

  const { data: unverified } = await supabase
    .from("artisan_profiles")
    .select("id, region, specialty, profiles(full_name)")
    .eq("verified", false);

  const projectById = new Map(projects.map((p) => [p.id, p]));

  const paymentsToConfirm = projects.filter(
    (p) => p.client_marked_paid_at && !p.funded_at
  );
  const conceptsToGenerate = projects.filter((p) => p.status === "submitted");
  const activeProjects = projects.filter((p) => OPEN_STATUSES.includes(p.status));
  const completedProjects = projects.filter((p) => p.status === "completed");

  const countsByStatus = OPEN_STATUSES.map((status) => ({
    status,
    count: projects.filter((p) => p.status === status).length,
  })).filter((row) => row.count > 0);

  const stats = [
    { label: "Live projects", value: activeProjects.length, hint: "moving now" },
    {
      label: "Payments to confirm",
      value: paymentsToConfirm.length,
      hint: paymentsToConfirm.length === 1 ? "1 waiting" : "waiting on you",
    },
    {
      label: "Awaiting client review",
      value: (awaitingReview || []).length,
      hint: "artisan stages sent",
    },
    {
      label: "Artisans to verify",
      value: (unverified || []).length,
      hint: "cannot claim yet",
    },
  ];

  const nothingToDo =
    paymentsToConfirm.length === 0 &&
    conceptsToGenerate.length === 0 &&
    (readyToPay || []).length === 0;

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl mb-1">
          {greeting()}, coordinator
        </h1>
        <p className="text-ink/55 text-sm">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
          {" · "}
          {projects.length === 0
            ? "No projects on Hopayola yet"
            : `${projects.length} project${projects.length === 1 ? "" : "s"} on Hopayola`}
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

      <section id="confirm" className="mb-10 scroll-mt-24">
        <h2 className="font-display text-xl mb-1">Needs your action</h2>
        <p className="text-xs text-ink/50 mb-5">
          Nothing here moves until Hopayola does it.
        </p>

        {nothingToDo ? (
          <p className="text-sm text-ink/50 border border-stone rounded-2xl p-8 text-center">
            All clear. Nothing is waiting on Hopayola right now.
          </p>
        ) : (
          <div className="space-y-4">
            {paymentsToConfirm.length > 0 && (
              <div className="border border-royal/30 bg-royal/5 rounded-2xl p-5">
                <p className="font-display text-lg mb-3">
                  Payments to confirm
                </p>
                <ul className="space-y-3">
                  {paymentsToConfirm.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm">{projectLabel(p)}</p>
                        <p className="text-[11px] text-ink/50">
                          {clientMap.get(p.client_id) || "Client"} says paid on{" "}
                          {new Date(p.client_marked_paid_at).toLocaleDateString(
                            "en-GB"
                          )}
                          {p.client_marked_paid_note
                            ? ` · "${p.client_marked_paid_note}"`
                            : ""}
                        </p>
                      </div>
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="bg-royal text-paper rounded-full px-4 py-1.5 text-xs hover:bg-royal-deep transition-colors"
                      >
                        Check and confirm
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {conceptsToGenerate.length > 0 && (
              <div className="border border-stone rounded-2xl p-5">
                <p className="font-display text-lg mb-3">
                  New briefs needing concepts
                </p>
                <ul className="space-y-3">
                  {conceptsToGenerate.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm">{projectLabel(p)}</p>
                        <p className="text-[11px] text-ink/50 capitalize">
                          {p.tier || "standard"} package ·{" "}
                          {clientMap.get(p.client_id) || "Client"}
                          {p.region ? ` · ${p.region}` : ""}
                        </p>
                      </div>
                      <Link
                        href="/admin/projects"
                        className="border border-royal text-royal rounded-full px-4 py-1.5 text-xs hover:bg-royal hover:text-paper transition-colors"
                      >
                        Generate concepts
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(readyToPay || []).length > 0 && (
              <div className="border border-stone rounded-2xl p-5">
                <p className="font-display text-lg mb-1">Ready to pay out</p>
                <p className="text-[11px] text-ink/50 mb-3">
                  The client approved these stages. The artisan has not been
                  paid yet.
                </p>
                <ul className="space-y-3">
                  {(readyToPay || []).map((m: any) => {
                    const project = projectById.get(m.project_id);
                    return (
                      <li
                        key={m.id}
                        className="flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm">
                            {m.milestone_name ||
                              `Milestone ${m.milestone_order}`}
                          </p>
                          <p className="text-[11px] text-ink/50">
                            {project ? projectLabel(project) : "Project"}
                            {m.amount
                              ? ` · NGN ${Number(m.amount).toLocaleString()}`
                              : ""}
                          </p>
                        </div>
                        <Link
                          href={`/admin/projects/${m.project_id}`}
                          className="bg-royal text-paper rounded-full px-4 py-1.5 text-xs hover:bg-royal-deep transition-colors"
                        >
                          Pay the artisan
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="min-w-0">
          <section className="mb-10">
            <h2 className="font-display text-xl mb-1">Awaiting client review</h2>
            <p className="text-xs text-ink/50 mb-5">
              Stages the artisan has sent. The client has not approved yet.
            </p>

            {!awaitingReview || awaitingReview.length === 0 ? (
              <p className="text-sm text-ink/50 border border-stone rounded-2xl p-8 text-center">
                Nothing sitting with a client right now.
              </p>
            ) : (
              <ul className="space-y-3">
                {(awaitingReview || []).map((m: any) => {
                  const project = projectById.get(m.project_id);
                  return (
                    <li
                      key={m.id}
                      className="border border-stone rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm">
                          {m.milestone_name || `Milestone ${m.milestone_order}`}
                        </p>
                        <p className="text-[11px] text-ink/50">
                          {project ? projectLabel(project) : "Project"}
                          {project
                            ? ` · ${clientMap.get(project.client_id) || "Client"}`
                            : ""}
                        </p>
                      </div>
                      <Link
                        href={`/admin/projects/${m.project_id}`}
                        className="text-xs text-royal hover:text-royal-deep"
                      >
                        Open project
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="mb-10">
            <h2 className="font-display text-xl mb-1">Latest briefs</h2>
            <p className="text-xs text-ink/50 mb-5">
              Newest first. Everything else lives under All projects.
            </p>

            {projects.length === 0 ? (
              <p className="text-sm text-ink/50 border border-stone rounded-2xl p-8 text-center">
                No projects yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {projects.slice(0, 5).map((p) => (
                  <li
                    key={p.id}
                    className="border border-stone rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm">{projectLabel(p)}</p>
                      <p className="text-[11px] text-ink/50 capitalize">
                        {clientMap.get(p.client_id) || "Client"} ·{" "}
                        {p.tier || "standard"} · {p.region || "abuja"}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] border border-stone rounded-full px-3 py-1 text-ink/60">
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section id="verify" className="scroll-mt-24 border border-stone rounded-2xl p-5">
            <h2 className="font-display text-lg mb-4">Artisans to verify</h2>

            {!unverified || unverified.length === 0 ? (
              <p className="text-sm text-ink/50">
                Every artisan on Hopayola is verified.
              </p>
            ) : (
              <>
                <p className="font-display text-3xl mb-1">{unverified.length}</p>
                <p className="text-[11px] text-ink/45 mb-4">
                  waiting before they can claim work
                </p>
                <ul className="space-y-2 text-sm mb-4">
                  {unverified.slice(0, 5).map((a: any) => (
                    <li key={a.id} className="text-ink/70">
                      {a.profiles?.full_name || "Unknown"}
                      <span className="block text-[11px] text-ink/40 capitalize">
                        {a.region || "abuja"}
                        {a.specialty && a.specialty.length > 0
                          ? ` · ${a.specialty.join(", ")}`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/admin/artisans"
                  className="inline-block text-sm text-royal hover:text-royal-deep"
                >
                  Review them
                </Link>
              </>
            )}
          </section>

          <section className="border border-stone rounded-2xl p-5">
            <h2 className="font-display text-lg mb-4">Where projects sit</h2>
            {countsByStatus.length === 0 ? (
              <p className="text-sm text-ink/50">Nothing in the pipeline.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {countsByStatus.map((row) => (
                  <li key={row.status} className="flex justify-between gap-4">
                    <span className="text-ink/70">
                      {STATUS_LABELS[row.status] ?? row.status}
                    </span>
                    <span className="text-ink/45">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[11px] text-ink/45 mt-4 pt-4 border-t border-stone">
              {completedProjects.length} completed all time
            </p>
          </section>

          <section className="border border-stone rounded-2xl p-5">
            <h2 className="font-display text-lg mb-4">Shortcuts</h2>
            <div className="space-y-2">
              <Link
                href="/admin/projects"
                className="block text-sm text-royal hover:text-royal-deep"
              >
                All projects
              </Link>
              <Link
                href="/admin/artisans"
                className="block text-sm text-royal hover:text-royal-deep"
              >
                Artisan directory
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
