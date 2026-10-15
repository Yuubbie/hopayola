import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  concepts_ready: "Concepts ready",
  concept_selected: "Concept selected",
  artisan_assigned: "Team assigned",
  in_production: "In production",
  milestone_review: "Awaiting review",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STAGES = [
  { label: "Brief", owner: "You" },
  { label: "Concept", owner: "You and our design studio" },
  { label: "Team", owner: "Hopayola coordination" },
  { label: "Fabric", owner: "You" },
  { label: "Payment", owner: "You" },
  { label: "Making", owner: "Your artisan" },
  { label: "Delivery", owner: "Hopayola coordination" },
];

type ProjectRow = {
  id: string;
  garment_type: string | null;
  occasion: string | null;
  status: string;
  tier: string | null;
  created_at: string;
  delivery_deadline: string | null;
  selected_concept_id: string | null;
  fabric_sent_at: string | null;
  fabric_received_at: string | null;
  funded_at: string | null;
  client_marked_paid_at: string | null;
  shipped_at: string | null;
  client_received_at: string | null;
  budget_min: number | null;
  budget_max: number | null;
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBudget(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => `NGN ${n.toLocaleString()}`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max as number)}`;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function isActiveProject(p: ProjectRow) {
  return p.status !== "completed" && p.status !== "cancelled";
}

function stageFlags(p: ProjectRow, milestones: any[], teamCount: number) {
  const teamWorking = [
    "artisan_assigned",
    "in_production",
    "milestone_review",
    "completed",
  ].includes(p.status);

  const allReviewed =
    milestones.length > 0 && milestones.every((m) => Boolean(m.confirmed_at));

  return [
    true,
    Boolean(p.selected_concept_id),
    teamCount > 0 || teamWorking,
    Boolean(p.fabric_received_at),
    Boolean(p.funded_at),
    allReviewed,
    Boolean(p.client_received_at),
  ];
}

export const dynamic = "force-dynamic";

export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; filter?: string }>;
}) {
  const { welcome, filter } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The layout already guards this, but keep the page self-contained.
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: projectRows } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  const projects = (projectRows || []) as unknown as ProjectRow[];
  const projectIds = projects.map((p) => p.id);

  const { data: teamAssignments } =
    projectIds.length > 0
      ? await supabase
          .from("project_team_members")
          .select("project_id, role_on_project, profiles(full_name)")
          .in("project_id", projectIds)
      : { data: [] as any[] };

  const teamByProject = new Map<string, { name: string; role: string }[]>();
  for (const row of (teamAssignments || []) as any[]) {
    const list = teamByProject.get(row.project_id) || [];
    list.push({
      name: row.profiles?.full_name || "An artisan",
      role: row.role_on_project,
    });
    teamByProject.set(row.project_id, list);
  }

  const { data: allMilestones } =
    projectIds.length > 0
      ? await supabase
          .from("project_milestones")
          .select("*")
          .in("project_id", projectIds)
          .order("milestone_order", { ascending: true })
      : { data: [] as any[] };

  const milestonesByProject = new Map<string, any[]>();
  for (const m of (allMilestones || []) as any[]) {
    const list = milestonesByProject.get(m.project_id) || [];
    list.push(m);
    milestonesByProject.set(m.project_id, list);
  }

  const { data: allConcepts } =
    projectIds.length > 0
      ? await supabase
          .from("ai_design_concepts")
          .select("project_id, image_url, is_selected, concept_number")
          .in("project_id", projectIds)
          .order("concept_number", { ascending: true })
      : { data: [] as any[] };

  const conceptImageByProject = new Map<string, string>();
  for (const c of (allConcepts || []) as any[]) {
    const usable = c.image_url && !String(c.image_url).includes("concept-placeholder");
    if (!usable) continue;
    if (c.is_selected) {
      conceptImageByProject.set(c.project_id, c.image_url);
    } else if (!conceptImageByProject.has(c.project_id)) {
      conceptImageByProject.set(c.project_id, c.image_url);
    }
  }

  const active = projects.filter(isActiveProject);
  const completed = projects.filter(
    (p) => p.status === "completed" || Boolean(p.client_received_at)
  );

  // Anything waiting on the client.
  const todo: { label: string; href: string; project: ProjectRow }[] = [];
  for (const p of active) {
    const milestones = milestonesByProject.get(p.id) || [];
    const awaitingReview = milestones.some(
      (m) => m.submitted_at && !m.confirmed_at
    );

    if (p.status === "concepts_ready" || (p.status === "submitted" && !p.selected_concept_id)) {
      todo.push({
        label: "Choose your design concept",
        href: `/projects/${p.id}/concepts`,
        project: p,
      });
      continue;
    }
    if (p.selected_concept_id && !p.fabric_sent_at) {
      todo.push({
        label: "Send your fabric through",
        href: `/account/projects/${p.id}`,
        project: p,
      });
      continue;
    }
    if (p.fabric_received_at && !p.funded_at) {
      todo.push({
        label: p.client_marked_paid_at
          ? "Payment with Hopayola for confirmation"
          : "Set up the held payment",
        href: `/account/projects/${p.id}`,
        project: p,
      });
      continue;
    }
    if (awaitingReview) {
      todo.push({
        label: "Review a finished milestone",
        href: `/account/projects/${p.id}`,
        project: p,
      });
      continue;
    }
    if (p.shipped_at && !p.client_received_at) {
      todo.push({
        label: "Confirm the outfit arrived",
        href: `/account/projects/${p.id}`,
        project: p,
      });
    }
  }

  // Recent activity, built from the real timestamps we hold.
  type Event = { at: string; text: string; project: ProjectRow };
  const events: Event[] = [];
  for (const p of projects) {
    const label = `${p.garment_type || "Project"}${p.occasion ? ` - ${p.occasion}` : ""}`;
    if (p.created_at) {
      events.push({ at: p.created_at, text: `Brief submitted for ${label}`, project: p });
    }
    const stamps: [string | null, string][] = [
      [p.fabric_sent_at, "Fabric sent"],
      [p.fabric_received_at, "Fabric reached the artisan"],
      [p.funded_at, "Payment held by Hopayola"],
      [p.shipped_at, "Outfit sent for delivery"],
      [p.client_received_at, "Outfit received and artisan paid"],
    ];
    for (const [at, verb] of stamps) {
      if (at) events.push({ at, text: `${verb} - ${label}`, project: p });
    }
    for (const m of milestonesByProject.get(p.id) || []) {
      const name = m.milestone_name || `Milestone ${m.milestone_order}`;
      if (m.submitted_at) {
        events.push({ at: m.submitted_at, text: `${name} finished by your artisan`, project: p });
      }
      if (m.confirmed_at) {
        events.push({ at: m.confirmed_at, text: `You approved ${name}`, project: p });
      }
    }
  }
  events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const recent = events.slice(0, 6);

  const upcoming = active
    .filter((p) => p.delivery_deadline)
    .sort(
      (a, b) =>
        new Date(a.delivery_deadline as string).getTime() -
        new Date(b.delivery_deadline as string).getTime()
    )
    .slice(0, 3);

  const flagship = active[0] || projects[0] || null;
  const flagshipMilestones = flagship
    ? milestonesByProject.get(flagship.id) || []
    : [];
  const flagshipFlags = flagship
    ? stageFlags(
        flagship,
        flagshipMilestones,
        (teamByProject.get(flagship.id) || []).length
      )
    : [];
  const currentStage = flagshipFlags.findIndex((f) => !f);
  const flagshipTeam = flagship ? teamByProject.get(flagship.id) || [] : [];

  const visibleProjects =
    filter === "active"
      ? active
      : filter === "completed"
        ? completed
        : projects;

  const stats = [
    { label: "Projects", value: projects.length, hint: "all time" },
    { label: "In progress", value: active.length, hint: "being worked on" },
    { label: "Completed", value: completed.length, hint: "delivered" },
    {
      label: "Needs you",
      value: todo.length,
      hint: todo.length === 1 ? "1 thing to do" : "things to do",
    },
  ];

  const tabs = [
    { key: "", label: "All", count: projects.length },
    { key: "active", label: "Active", count: active.length },
    { key: "completed", label: "Completed", count: completed.length },
  ];

  return (
    <div className="max-w-6xl">
      {welcome && (
        <div className="mb-6 border border-royal/20 bg-royal/5 rounded-2xl p-4 text-sm text-royal-deep">
          You&apos;re all set. Start a project when you&apos;re ready.
        </div>
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
          {active.length === 0
            ? "No projects running right now"
            : `${active.length} project${active.length === 1 ? "" : "s"} in progress`}
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
          <section id="projects" className="mb-10 scroll-mt-24">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="font-display text-xl">My projects</h2>
              <div className="flex gap-1 text-xs">
                {tabs.map((t) => {
                  const isOn = (filter || "") === t.key;
                  return (
                    <Link
                      key={t.key || "all"}
                      href={t.key ? `/account?filter=${t.key}#projects` : "/account#projects"}
                      className={`rounded-full px-3 py-1.5 transition-colors ${
                        isOn
                          ? "bg-royal text-paper"
                          : "border border-stone text-ink/60 hover:border-ink/30"
                      }`}
                    >
                      {t.label} {t.count}
                    </Link>
                  );
                })}
              </div>
            </div>

            {visibleProjects.length === 0 ? (
              <div className="border border-stone rounded-2xl p-8 text-center">
                <p className="text-ink/55 text-sm mb-4">
                  Nothing here yet. Tell us the occasion and we&apos;ll take it
                  from there.
                </p>
                <Link
                  href="/projects/new"
                  className="inline-block bg-royal text-paper text-sm px-5 py-2.5 rounded-full hover:bg-royal-deep transition-colors"
                >
                  Start a project
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {visibleProjects.map((p) => {
                  const milestones = milestonesByProject.get(p.id) || [];
                  const team = teamByProject.get(p.id) || [];
                  const flags = stageFlags(p, milestones, team.length);
                  const done = flags.filter(Boolean).length;
                  const percent = Math.round((done / flags.length) * 100);
                  const image = conceptImageByProject.get(p.id);
                  const deadline = formatDate(p.delivery_deadline);
                  const budget = formatBudget(p.budget_min, p.budget_max);

                  return (
                    <article
                      key={p.id}
                      className="border border-stone rounded-2xl overflow-hidden flex flex-col bg-paper"
                    >
                      <div className="relative aspect-[16/10] bg-stone/40">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-display text-4xl text-royal/25">
                              {(p.garment_type || "H").charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-paper/95 border border-stone text-[11px] rounded-full px-3 py-1 text-royal-deep">
                          {STATUS_LABELS[p.status] ?? p.status}
                        </span>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <p className="font-medium text-sm mb-1">
                          {p.garment_type || "Project"}
                          {p.occasion ? ` - ${p.occasion}` : ""}
                        </p>
                        <p className="text-xs text-ink/50 mb-4 capitalize">
                          {p.tier || "standard"} package
                          {budget ? ` | ${budget}` : ""}
                        </p>

                        <div className="mb-2 flex items-center justify-between text-[11px] text-ink/50">
                          <span>
                            Step {Math.min(done + 1, flags.length)} of {flags.length}
                          </span>
                          <span>{percent}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-stone mb-4 overflow-hidden">
                          <div
                            className="h-full bg-royal rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <p className="text-xs text-ink/55 mb-1">
                          {team.length > 0
                            ? team.map((t) => t.name).join(", ")
                            : "Team not assigned yet"}
                        </p>
                        <p className="text-xs text-ink/55 mb-5">
                          {deadline
                            ? `Expected completion ${deadline}`
                            : "Completion date to be confirmed"}
                        </p>

                        <Link
                          href={`/account/projects/${p.id}`}
                          className="mt-auto block text-center bg-royal text-paper rounded-lg py-2.5 text-sm hover:bg-royal-deep transition-colors"
                        >
                          View project
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {flagship && (
            <section className="mb-10 border border-stone rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-xl mb-1">Project timeline</h2>
                  <p className="text-xs text-ink/50">
                    {flagship.garment_type || "Project"}
                    {flagship.occasion ? ` - ${flagship.occasion}` : ""}
                  </p>
                </div>
                {flagship.delivery_deadline && (
                  <p className="text-xs text-ink/50 shrink-0">
                    Due {formatDate(flagship.delivery_deadline)}
                  </p>
                )}
              </div>

              <ol className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-y-6 gap-x-2">
                {STAGES.map((stage, i) => {
                  const isDone = flagshipFlags[i];
                  const isNow = i === currentStage;
                  return (
                    <li key={stage.label} className="flex flex-col items-center text-center">
                      <span
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs mb-2 border ${
                          isDone
                            ? "bg-royal text-paper border-royal"
                            : isNow
                              ? "border-royal text-royal bg-royal/10"
                              : "border-stone text-ink/30"
                        }`}
                      >
                        {isDone ? "✓" : i + 1}
                      </span>
                      <span
                        className={`text-[11px] ${
                          isDone || isNow ? "text-ink/75" : "text-ink/35"
                        }`}
                      >
                        {stage.label}
                      </span>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-6 pt-5 border-t border-stone text-sm">
                {currentStage === -1 ? (
                  <p className="text-green-700">
                    Everything is signed off. Your outfit has been delivered.
                  </p>
                ) : (
                  <>
                    <p className="text-ink/70">
                      <span className="text-ink/45">Now: </span>
                      {STAGES[currentStage].label}
                      <span className="text-ink/45"> · waiting on </span>
                      {STAGES[currentStage].label === "Making" && flagshipTeam.length > 0
                        ? flagshipTeam.map((t) => t.name).join(", ")
                        : STAGES[currentStage].owner}
                    </p>
                    <p className="text-xs text-ink/50 mt-1">
                      {STAGES[currentStage].label === "Making" &&
                      flagshipTeam.length === 0
                        ? "Your team is being assigned."
                        : `Next up: ${STAGES[Math.min(currentStage + 1, STAGES.length - 1)].label}`}
                    </p>
                  </>
                )}
              </div>

              <Link
                href={`/account/projects/${flagship.id}`}
                className="inline-block mt-5 text-sm text-royal hover:text-royal-deep"
              >
                Open full project
              </Link>
            </section>
          )}

          <section className="border border-stone rounded-2xl p-6">
            <h2 className="font-display text-xl mb-5">Recent activity</h2>
            {recent.length === 0 ? (
              <p className="text-sm text-ink/50">
                We&apos;ll log updates here as your projects move.
              </p>
            ) : (
              <ul className="space-y-4">
                {recent.map((e, i) => (
                  <li key={`${e.at}-${i}`} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-royal shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-ink/75">{e.text}</p>
                      <p className="text-[11px] text-ink/40">
                        {formatDate(e.at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-stone rounded-2xl p-5">
            <h2 className="font-display text-lg mb-4">Waiting on you</h2>
            {todo.length === 0 ? (
              <p className="text-sm text-ink/50">
                Nothing needs you right now. We&apos;ll email you when it does.
              </p>
            ) : (
              <ul className="space-y-3">
                {todo.map((t, i) => (
                  <li key={`${t.project.id}-${i}`}>
                    <Link
                      href={t.href}
                      className="block rounded-xl border border-stone p-3 hover:border-royal transition-colors"
                    >
                      <span className="block text-sm text-ink/80">{t.label}</span>
                      <span className="block text-[11px] text-ink/45 mt-0.5">
                        {t.project.garment_type || "Project"}
                        {t.project.occasion ? ` - ${t.project.occasion}` : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-stone rounded-2xl p-5">
            <h2 className="font-display text-lg mb-4">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-ink/50">No dates in the diary yet.</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((p) => (
                  <li key={p.id} className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-ink/70 truncate">
                      {p.garment_type || "Project"}
                    </span>
                    <span className="text-xs text-ink/45 shrink-0">
                      {formatDate(p.delivery_deadline)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-stone rounded-2xl p-5">
            <h2 className="font-display text-lg mb-4">Payments</h2>
            {active.length === 0 ? (
              <p className="text-sm text-ink/50">No open payments.</p>
            ) : (
              <ul className="space-y-3">
                {active.map((p) => (
                  <li key={p.id}>
                    <p className="text-sm text-ink/75 truncate">
                      {p.garment_type || "Project"}
                    </p>
                    <p className="text-[11px] text-ink/45">
                      {p.client_received_at
                        ? "Released to your artisan"
                        : p.funded_at
                          ? "Held safely by Hopayola"
                          : "Not set up yet"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-stone rounded-2xl p-5">
            <h2 className="font-display text-lg mb-4">Quick actions</h2>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/projects/new" className="text-royal hover:text-royal-deep">
                  Start a new project
                </Link>
              </li>
              <li>
                <Link href="/lifestyle" className="text-royal hover:text-royal-deep">
                  Open my wardrobe
                </Link>
              </li>
              <li>
                <a
                  href="https://shop.hopayola.com"
                  className="text-royal hover:text-royal-deep"
                >
                  Visit the shop
                </a>
              </li>
              <li>
                <Link
                  href="/account/messages"
                  className="text-royal hover:text-royal-deep"
                >
                  Message my coordinator
                </Link>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
