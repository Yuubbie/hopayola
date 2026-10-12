import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { claimProject } from "./actions";
import ProjectChat from "@/components/ProjectChat";
import ProjectSequence from "@/components/ProjectSequence";

const STATUS_LABELS: Record<string, string> = {
  concept_selected: "Ready to match",
  artisan_assigned: "Team assigned",
  in_production: "In production",
  milestone_review: "Awaiting review",
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ArtisanAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "artisan") {
    redirect("/account");
  }

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
      : { data: [] as Record<string, unknown>[] };

  const projectById = new Map(
    (assignedProjects || []).map((p: { id: string }) => [p.id, p])
  );
  const myAssignments = assignedIds.map((project_id) => ({
    project_id,
    projects: projectById.get(project_id) || null,
  }));

  const { data: openProjects } = await service
    .from("projects")
    .select("*")
    .in("status", ["submitted", "concepts_ready", "concept_selected"])
    .eq("region", artisanProfile?.region || "abuja")
    .order("created_at", { ascending: false });

  const { data: myMilestones } =
    assignedIds.length > 0
      ? await service
          .from("project_milestones")
          .select("*")
          .in("project_id", assignedIds)
          .order("milestone_order", { ascending: true })
      : { data: [] as { project_id: string }[] };

  const milestonesByProject = new Map<string, any[]>();
  for (const m of myMilestones || []) {
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
        Your jobs, payout status, and open projects in your area.
      </p>

      <div className="space-y-6">
        <section className="border border-stone rounded-2xl p-6">
            <h2 className="font-display text-lg mb-4">Your claimed projects</h2>
            {myAssignments.length === 0 ? (
              <p className="text-ink/50 text-sm">
                No claimed jobs on this login yet. If Hope assigned you in
                admin, they should appear here after a refresh.
              </p>
            ) : (
            <ul className="space-y-3">
              {myAssignments.map((a: any) => (
                <li key={a.project_id} className="border border-stone rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-sm">
                      {a.projects?.garment_type || "Project"}
                      {a.projects?.occasion ? ` - ${a.projects.occasion}` : ""}
                    </span>
                    <span className="shrink-0 text-xs border border-stone rounded-full px-2 py-1 text-ink/60 capitalize">
                      {(a.projects?.status || "").replace(/_/g, " ")}
                    </span>
                  </div>
                  {a.projects && (
                    <ProjectSequence
                      project={a.projects}
                      role="artisan"
                      milestones={milestonesByProject.get(a.project_id) || []}
                      viewerId={user.id}
                    />
                  )}
                  <ProjectChat projectId={a.project_id} viewerRole="artisan" />
                </li>
              ))}
            </ul>
            )}
          </section>

        <section className="border border-stone rounded-2xl p-6">
          <h2 className="font-display text-lg mb-4">Open projects near you</h2>

          {!openProjects || openProjects.length === 0 ? (
            <p className="text-ink/50 text-sm">
              No projects are open for matching in {artisanProfile?.region || "your region"} right now.
              Check back soon.
            </p>
          ) : (
            <ul className="space-y-3">
              {openProjects.map((p) => {
                const deadline = formatDate(p.delivery_deadline);
                return (
                  <li key={p.id} className="border border-stone rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <span className="font-medium text-sm">
                        {p.garment_type || "Project"}
                        {p.occasion ? ` - ${p.occasion}` : ""}
                      </span>
                      <span className="shrink-0 text-xs border border-stone rounded-full px-2 py-1 text-ink/60">
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </div>
                    <p className="text-ink/50 text-xs capitalize mb-3">
                      {p.tier} package
                      {deadline ? ` | Due ${deadline}` : ""}
                    </p>
                    <form action={claimProject}>
                      <input type="hidden" name="projectId" value={p.id} />
                      <button
                        type="submit"
                        className="bg-royal text-paper rounded-lg px-4 py-1.5 text-sm hover:bg-royal-deep transition-colors"
                      >
                        Claim this project
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="border border-stone rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">Your artisan profile</h2>
            <Link
              href="/artisan/account/edit"
              className="text-sm text-royal hover:text-royal-deep"
            >
              Edit
            </Link>
          </div>

          <dl className="text-sm space-y-2">
            <div className="flex justify-between">
              <dt className="text-ink/50">Name</dt>
              <dd>{profile?.full_name || "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Region</dt>
              <dd className="capitalize">{artisanProfile?.region || "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Availability</dt>
              <dd className="capitalize">
                {(artisanProfile?.availability_status || "unavailable").replace("_", " ")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Specialty</dt>
              <dd>{(artisanProfile?.specialty || []).join(", ") || "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Skills</dt>
              <dd>{(artisanProfile?.skills || []).join(", ") || "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Verified</dt>
              <dd>{artisanProfile?.verified ? "Yes" : "Pending review"}</dd>
            </div>
          </dl>

          {artisanProfile?.bio && (
            <p className="text-sm text-ink/60 mt-4 border-t border-stone pt-4">
              {artisanProfile.bio}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
