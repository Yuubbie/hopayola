import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectChat from "@/components/ProjectChat";
import ProjectSequence from "@/components/ProjectSequence";
import { withProofUrls } from "@/lib/milestone-proofs";
import DeleteProjectButton from "@/components/delete-project-button";

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

export const dynamic = "force-dynamic";

export default async function ProjectDetail({
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
    return null;
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("client_id", user.id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const { data: teamAssignments } = await supabase
    .from("project_team_members")
    .select("project_id, role_on_project, profiles(full_name)")
    .eq("project_id", id);

  const team = (teamAssignments || []).map((row: any) => ({
    name: row.profiles?.full_name || "An artisan",
    role: row.role_on_project,
  }));

  const { data: milestones } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("project_id", id)
    .order("milestone_order", { ascending: true });

  const milestoneList = await withProofUrls((milestones || []) as any[]);
  const budget = formatBudget(project.budget_min, project.budget_max);
  const deadline = formatDate(project.delivery_deadline);

  return (
    <div className="max-w-3xl">
      <Link
        href="/account#projects"
        className="text-xs text-ink/50 hover:text-royal"
      >
        &larr; Back to dashboard
      </Link>

      <header className="mt-4 mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="font-display text-2xl md:text-3xl">
            {project.garment_type || "Project"}
            {project.occasion ? ` - ${project.occasion}` : ""}
          </h1>
          <span className="text-xs border border-stone rounded-full px-3 py-1 text-ink/60">
            {STATUS_LABELS[project.status] ?? project.status}
          </span>
        </div>
        <p className="text-sm text-ink/55 capitalize">
          {project.tier} package
          {deadline ? ` | Expected completion ${deadline}` : ""}
          {budget ? ` | ${budget}` : ""}
        </p>
        {project.status === "cancelled" && (
          <p className="text-sm text-red-800 mt-3 border border-red-200 bg-red-50 rounded-xl px-4 py-3">
            Hopayola cancelled this project
            {project.cancelled_note ? `: ${project.cancelled_note}` : "."}
            {project.funded_at
              ? " If you paid, the coordinator is handling the refund."
              : ""}
          </p>
        )}
      </header>

      <p className="text-xs text-ink/55 border border-stone rounded-xl px-4 py-3 mb-6 leading-relaxed">
        Delivery: your outfit ships in a Hopayola box. The artisan may wrap it
        in their own branding inside that box.
      </p>

      <section className="border border-stone rounded-2xl p-6 mb-6">
        <h2 className="font-display text-lg mb-4">Project sequence</h2>

        <ProjectSequence
          project={{
            id: project.id,
            funded_at: project.funded_at,
            fabric_sent_at: project.fabric_sent_at,
            fabric_received_at: project.fabric_received_at,
            shipped_at: project.shipped_at,
            client_received_at: project.client_received_at,
            status: project.status,
          }}
          role="client"
          milestones={milestoneList.map((m: any) => ({
            id: m.id,
            milestone_name: m.milestone_name,
            milestone_order: m.milestone_order,
            status: m.status,
            submitted_at: m.submitted_at,
            confirmed_at: m.confirmed_at,
            artisan_id: m.artisan_id,
            proof_href: m.proof_href,
          }))}
        />

        {project.status === "concepts_ready" && (
          <div className="mt-4 pt-4 border-t border-stone">
            <Link
              href={`/projects/${project.id}/concepts`}
              className="text-sm text-royal hover:text-royal-deep font-medium"
            >
              View your design concepts
            </Link>
          </div>
        )}

        {project.funded_at && (
          <div className="mt-4 pt-4 border-t border-stone">
            <p className="text-xs text-green-700">
              Payment held by Hopayola. The artisan is paid when you mark the
              outfit received.
            </p>
            {milestoneList.length > 0 && (
              <ul className="mt-3 space-y-2">
                {milestoneList.map((m: any) => (
                  <li key={m.id} className="text-xs text-ink/70">
                    <span className="font-medium">
                      {m.milestone_name || `Milestone ${m.milestone_order}`}
                    </span>
                    {" — "}
                    {m.status === "paid"
                      ? "paid"
                      : m.confirmed_at
                        ? "confirmed · payout pending"
                        : String(m.status).replace(/_/g, " ")}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section className="border border-stone rounded-2xl p-6 mb-6">
        <h2 className="font-display text-lg mb-4">Your team</h2>
        {team.length === 0 ? (
          <p className="text-sm text-ink/50">
            We&apos;re matching you with the right artisan. You&apos;ll see them
            here once assigned.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {team.map((t, i: number) => (
              <li key={`${t.name}-${i}`} className="flex justify-between gap-4">
                <span className="text-ink/75">{t.name}</span>
                <span className="text-ink/45 capitalize">
                  {String(t.role).replace(/_/g, " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border border-stone rounded-2xl p-6 mb-6">
        <h2 className="font-display text-lg mb-4">Messages and updates</h2>
        <ProjectChat projectId={project.id} viewerRole="client" />
      </section>

      {!project.funded_at && project.status !== "cancelled" && (
        <section className="border border-stone rounded-2xl p-6">
          <h2 className="font-display text-lg mb-2">Cancel this project</h2>
          <p className="text-sm text-ink/55 mb-4">
            You can only do this before the work is funded. Once money is held,
            talk to your coordinator instead.
          </p>
          <DeleteProjectButton
            projectId={project.id}
            className="text-xs border border-ink/20 rounded-full px-4 py-2 text-ink/70 hover:border-red-700 hover:text-red-700 transition-colors"
          />
        </section>
      )}
    </div>
  );
}
