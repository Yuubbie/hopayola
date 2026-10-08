import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { claimProject } from "@/app/artisan/account/actions";

function specialtyText(specialty: unknown) {
  if (Array.isArray(specialty)) return specialty.filter(Boolean).join(", ");
  if (typeof specialty === "string" && specialty.trim()) return specialty;
  return "Specialty TBC";
}

export default async function FashionMarket() {
  const supabase = createServiceClient();
  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  let isArtisan = false;
  if (user) {
    const { data: ap } = await auth
      .from("artisan_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    isArtisan = Boolean(ap);
  }

  const { data: artisans } = await supabase
    .from("artisan_profiles")
    .select("id, region, specialty, bio, verified")
    .limit(24);

  const artisanIds = (artisans || []).map((a) => a.id);
  const { data: names } = artisanIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", artisanIds)
    : { data: [] as { id: string; full_name: string | null }[] };

  const nameById = new Map(
    (names || []).map((n) => [n.id, n.full_name || "Artisan"])
  );

  const { data: allProjects } = await supabase
    .from("projects")
    .select("id, garment_type, occasion, region, tier, status, created_at")
    .order("created_at", { ascending: false })
    .limit(24);

  const closed = new Set(["completed", "cancelled", "paid"]);
  const projects = (allProjects || []).filter(
    (p) => !closed.has(String(p.status || ""))
  );

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 pb-24 md:pb-32 space-y-20">
      <section>
        <h2 className="font-display text-2xl mb-2">Artisans available</h2>
        <p className="text-ink/55 text-sm mb-6">
          Anyone can browse. Sign in to start a project — work stays on
          Hopayola.
        </p>
        {!artisans?.length ? (
          <p className="text-sm text-ink/45">No artisans listed yet.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {artisans.map((a) => (
              <li
                key={a.id}
                className="border border-stone rounded-2xl p-5"
              >
                <p className="font-medium text-sm">
                  {nameById.get(a.id) || "Artisan"}
                  {a.verified ? (
                    <span className="text-royal text-xs ml-2">Verified</span>
                  ) : null}
                </p>
                <p className="text-xs text-ink/50 mt-1 capitalize">
                  {specialtyText(a.specialty)} · {a.region || "Abuja"}
                </p>
                {a.bio ? (
                  <p className="text-xs text-ink/60 mt-2 line-clamp-3">{a.bio}</p>
                ) : null}
                <Link
                  href="/projects/new"
                  className="inline-block mt-3 text-xs text-royal"
                >
                  Start a project
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl mb-2">Projects available</h2>
        <p className="text-ink/55 text-sm mb-6">
          Open briefs. Artisans can claim here or from their account.
        </p>
        {!projects?.length ? (
          <p className="text-sm text-ink/45">No open projects right now.</p>
        ) : (
          <ul className="space-y-3">
            {projects.map((p) => (
              <li
                key={p.id}
                className="border border-stone rounded-xl px-4 py-3 flex justify-between gap-3"
              >
                <span className="text-sm">
                  {p.garment_type || "Project"}
                  {p.occasion ? ` · ${p.occasion}` : ""}
                  <span className="block text-xs text-ink/45 capitalize">
                    {p.tier} · {p.region} ·{" "}
                    {String(p.status || "").replace(/_/g, " ")}
                  </span>
                </span>
                {p.status === "artisan_assigned" ||
                p.status === "in_production" ||
                p.status === "milestone_review" ? (
                  <span className="text-xs text-ink/40 shrink-0 self-center">
                    Claimed
                  </span>
                ) : isArtisan ? (
                  <form action={claimProject} className="shrink-0 self-center">
                    <input type="hidden" name="projectId" value={p.id} />
                    <button
                      type="submit"
                      className="text-xs bg-royal text-paper rounded-full px-3 py-1.5"
                    >
                      Claim
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/artisan/sign-up"
                    className="text-xs text-royal shrink-0 self-center"
                  >
                    Join to claim
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
