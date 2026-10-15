import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import ProjectChat from "@/components/ProjectChat";
import ProjectSequence from "@/components/ProjectSequence";

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

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const dynamic = "force-dynamic";

export default async function ArtisanJobDetail({
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

  const service = createServiceClient();
  const email = (user.email || "").toLowerCase();

  const { data: emailProfiles } = email
    ? await service.from("profiles").select("id").ilike("email", email)
    : { data: [] as { id: string }[] };
  const artisanIds = Array.from(
    new Set([user.id, ...(emailProfiles || []).map((p) => p.id)])
  );

  const { data: assignment } = await service
    .from("project_team_members")
    .select("project_id")
    .eq("project_id", id)
    .in("artisan_id", artisanIds)
    .maybeSingle();

  if (!assignment) {
    notFound();
  }

  const { data: project } = await service
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const { data: milestones } = await service
    .from("project_milestones")
    .select("*")
    .eq("project_id", id)
    .order("milestone_order", { ascending: true });

  const milestoneList = milestones || [];

  return (
    <div className="max-w-3xl">
      <Link
        href="/artisan/account#jobs"
        className="text-xs text-ink/50 hover:text-royal"
      >
        &larr; Back to my jobs
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
          {project.delivery_deadline
            ? ` | Due ${formatDate(project.delivery_deadline)}`
            : ""}
        </p>
      </header>

      <section className="border border-stone rounded-2xl p-6 mb-6">
        <h2 className="font-display text-lg mb-4">What to do next</h2>
        <ProjectSequence
          project={project}
          role="artisan"
          viewerId={user.id}
          milestones={milestoneList}
        />
      </section>

      <section className="border border-stone rounded-2xl p-6">
        <h2 className="font-display text-lg mb-4">Messages and updates</h2>
        <ProjectChat projectId={id} viewerRole="artisan" />
      </section>
    </div>
  );
}
