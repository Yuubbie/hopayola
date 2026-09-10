import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProjectStatus } from "./actions";

const STATUS_OPTIONS = [
  "draft",
  "submitted",
  "concepts_ready",
  "concept_selected",
  "artisan_assigned",
  "in_production",
  "milestone_review",
  "completed",
  "cancelled",
];

export default async function AdminProjects() {
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

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const clientIds = [...new Set((projects || []).map((p) => p.client_id))];
  const { data: clientProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .in("id", clientIds.length > 0 ? clientIds : ["none"]);

  const clientMap = new Map(
    (clientProfiles || []).map((c) => [c.id, c])
  );

  const projectsWithPhotos = await Promise.all(
    (projects || []).map(async (p) => {
      let photoUrl: string | null = null;
      if (p.fabric_image_urls && p.fabric_image_urls.length > 0) {
        const { data } = await supabase.storage
          .from("project-fabrics")
          .createSignedUrl(p.fabric_image_urls[0], 3600);
        photoUrl = data?.signedUrl || null;
      }
      return { ...p, photoUrl, client: clientMap.get(p.client_id) };
    })
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="font-display text-3xl mb-2">Admin - Projects</h1>
      <p className="text-ink/60 mb-12">
        Review submitted projects and move them through the pipeline
        manually.
      </p>

      {projectsWithPhotos.length === 0 ? (
        <p className="text-ink/50 text-sm">No projects yet.</p>
      ) : (
        <div className="space-y-4">
          {projectsWithPhotos.map((p) => (
            <div
              key={p.id}
              className="border border-stone rounded-2xl p-6 flex gap-6"
            >
              {p.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.photoUrl}
                  alt="Fabric"
                  className="w-24 h-24 object-cover rounded-lg border border-stone shrink-0"
                />
              )}

              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <span className="font-medium text-sm">
                    {p.garment_type || "Project"}
                    {p.occasion ? ` - ${p.occasion}` : ""}
                  </span>
                  <span className="shrink-0 text-xs border border-stone rounded-full px-2 py-1 text-ink/60 capitalize">
                    {p.status.replace(/_/g, " ")}
                  </span>
                </div>

                <p className="text-ink/50 text-xs mb-3">
                  Client: {p.client?.full_name || "Unknown"}
                  {p.client?.phone ? ` | ${p.client.phone}` : ""}
                  {" | "}
                  {p.tier} package
                  {p.region ? ` | ${p.region}` : ""}
                </p>

                {p.style_direction && (
                  <p className="text-ink/60 text-xs mb-3">
                    {p.style_direction}
                  </p>
                )}

                <form
                  action={updateProjectStatus}
                  className="flex items-center gap-2"
                >
                  <input type="hidden" name="projectId" value={p.id} />
                  <select
                    name="status"
                    defaultValue={p.status}
                    className="border border-stone rounded-lg px-3 py-1.5 text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => (
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
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}