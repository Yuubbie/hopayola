import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { addMilestone, updateMilestoneStatus } from "./actions";

const MILESTONE_STATUS_OPTIONS = ["pending", "in_progress", "completed", "paid"];

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

  const { data: milestones } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("project_id", id)
    .order("milestone_order", { ascending: true });

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
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
      <p className="text-ink/60 mb-12 capitalize">
        {project.tier} package | {project.status.replace(/_/g, " ")} |{" "}
        {project.region}
      </p>

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
                    {m.amount && (
                      <span className="text-ink/50 text-xs block">
                        NGN {Number(m.amount).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-xs border border-stone rounded-full px-2 py-1 text-ink/60 capitalize">
                    {m.status.replace(/_/g, " ")}
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
              Amount (NGN) <span className="text-ink/30">(optional)</span>
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0"
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-royal text-paper rounded-lg px-4 py-2 text-sm hover:bg-royal-deep transition-colors"
          >
            Add milestone
          </button>
        </form>
      </section>
    </main>
  );
}