import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PayProjectButton from "@/components/pay-project-button";
import MilestoneClientActions from "@/components/milestone-client-actions";
import ProjectChat from "@/components/ProjectChat";

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

export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; welcome?: string }>;
}) {
  const { project: justSubmittedId, welcome } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "artisan") {
    redirect(welcome === "artisan" ? "/artisan/account?welcome=1" : "/artisan/account");
  }

  if (profile?.role === "admin") {
    redirect("/admin/projects");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  const projectIds = (projects || []).map((p) => p.id);

  const { data: teamAssignments } = await supabase
    .from("project_team_members")
    .select("project_id, role_on_project, profiles(full_name)")
    .in("project_id", projectIds.length > 0 ? projectIds : ["none"]);

  const teamByProject = new Map<string, { name: string; role: string }[]>();
  for (const row of teamAssignments || []) {
    const list = teamByProject.get(row.project_id) || [];
    const artisanName = (row as any).profiles?.full_name || "An artisan";
    list.push({ name: artisanName, role: row.role_on_project });
    teamByProject.set(row.project_id, list);
  }

  const { data: allMilestones } = await supabase
    .from("project_milestones")
    .select("*")
    .in("project_id", projectIds.length > 0 ? projectIds : ["none"])
    .order("milestone_order", { ascending: true });

  const milestonesByProject = new Map<string, any[]>();
  for (const m of allMilestones || []) {
    const list = milestonesByProject.get(m.project_id) || [];
    list.push(m);
    milestonesByProject.set(m.project_id, list);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="font-display text-3xl mb-2">
        Hello, {profile?.full_name || "there"}
      </h1>
      <p className="text-ink/60 mb-12">
        Your projects, payments, and milestone reviews.
      </p>

      {justSubmittedId && (
        <div className="mb-6 border border-royal/20 bg-royal/5 rounded-2xl p-4 text-sm text-royal-deep">
          Your project has been submitted. We&apos;ll be in touch once design
          concepts are ready.
        </div>
      )}

      <div className="space-y-6">
        <section className="border border-stone rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">Your projects</h2>
            <Link
              href="/projects/new"
              className="text-sm text-royal hover:text-royal-deep"
            >
              Start a project
            </Link>
          </div>

          {!projects || projects.length === 0 ? (
            <p className="text-ink/50 text-sm">
              You haven&apos;t started a project yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {projects.map((p) => {
                const budget = formatBudget(p.budget_min, p.budget_max);
                const deadline = formatDate(p.delivery_deadline);
                const team = teamByProject.get(p.id);
                const projectMilestones = milestonesByProject.get(p.id) || [];

                return (
                  <li
                    key={p.id}
                    className="border border-stone rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <span className="font-medium text-sm">
                        {p.garment_type || "Project"}
                        {p.occasion ? ` - ${p.occasion}` : ""}
                      </span>
                      <span className="shrink-0 text-xs border border-stone rounded-full px-2 py-1 text-ink/60">
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </div>

                    <p className="text-ink/50 text-xs capitalize">
                      {p.tier} package
                      {deadline ? ` | Due ${deadline}` : ""}
                      {budget ? ` | ${budget}` : ""}
                    </p>

                    {p.status === "concepts_ready" && (
                      <div className="mt-3 pt-3 border-t border-stone">
                        <Link
                          href={`/projects/${p.id}/concepts`}
                          className="text-xs text-royal hover:text-royal-deep font-medium"
                        >
                          View your design concepts
                        </Link>
                      </div>
                    )}

                    {team && team.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-stone">
                        <p className="text-xs text-royal-deep">
                          Assigned to {team.map((t) => t.name).join(", ")}
                        </p>
                      </div>
                    )}

                    {!p.funded_at && (
                      <PayProjectButton projectId={p.id} />
                    )}

                    {p.funded_at && (
                      <div className="mt-3 pt-3 border-t border-stone">
                        <p className="text-xs text-green-700">
                          Payment received. Artisans are paid after each verified milestone.
                        </p>
                        {projectMilestones.length > 0 && (
                          <ul className="mt-2 space-y-2">
                            {projectMilestones.map((m) => (
                              <li key={m.id} className="text-xs text-ink/70">
                                <span className="font-medium">{m.milestone_name}</span>
                                {" — "}
                                {m.status === "paid"
                                  ? "paid"
                                  : m.confirmed_at
                                    ? "confirmed · payout pending"
                                    : String(m.status).replace(/_/g, " ")}
                                <MilestoneClientActions
                                  milestoneId={m.id}
                                  projectId={p.id}
                                  status={m.status}
                                  confirmedAt={m.confirmed_at}
                                />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    <ProjectChat projectId={p.id} viewerRole="client" />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="border border-stone rounded-2xl p-6">
          <h2 className="font-display text-lg mb-4">Your details</h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between">
              <dt className="text-ink/50">Name</dt>
              <dd>{profile?.full_name || "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Email</dt>
              <dd>{user.email}</dd>
            </div>
          </dl>
        </section>

        <section className="border border-stone rounded-2xl p-6">
          <h2 className="font-display text-lg mb-2">Order history</h2>
          <p className="text-ink/50 text-sm">
            Purchases from the shop will appear here.
          </p>
        </section>
      </div>
    </main>
  );
}
