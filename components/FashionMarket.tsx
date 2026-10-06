import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";

export default async function FashionMarket() {
  const supabase = createServiceClient();

  const { data: artisans } = await supabase
    .from("artisan_profiles")
    .select("id, region, specialty, bio, verified, profiles(full_name)")
    .order("verified", { ascending: false })
    .limit(24);

  const { data: projects } = await supabase
    .from("projects")
    .select("id, garment_type, occasion, region, tier, status, created_at")
    .in("status", ["submitted", "concept_selected", "concepts_ready"])
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 space-y-16">
      <section>
        <h2 className="font-display text-2xl mb-2">Artisans available</h2>
        <p className="text-ink/55 text-sm mb-6">
          Sign up as a client, then start a project to work with them on Hopayola
          — not off-platform.
        </p>
        {!artisans?.length ? (
          <p className="text-sm text-ink/45">No artisans listed yet.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {artisans.map((a: {
              id: string;
              region?: string | null;
              specialty?: string[] | null;
              bio?: string | null;
              verified?: boolean | null;
              profiles?: { full_name?: string | null } | null;
            }) => (
              <li
                key={a.id}
                className="border border-stone rounded-2xl p-5"
              >
                <p className="font-medium text-sm">
                  {a.profiles?.full_name || "Artisan"}
                  {a.verified ? (
                    <span className="text-royal text-xs ml-2">Verified</span>
                  ) : null}
                </p>
                <p className="text-xs text-ink/50 mt-1 capitalize">
                  {(a.specialty || []).join(", ") || "Specialty TBC"} ·{" "}
                  {a.region || "Abuja"}
                </p>
                {a.bio && (
                  <p className="text-xs text-ink/60 mt-2 line-clamp-3">{a.bio}</p>
                )}
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
          Artisans claim these from their account. Clients: start your own brief.
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
                    {p.tier} · {p.region} · {String(p.status).replace(/_/g, " ")}
                  </span>
                </span>
                <Link
                  href="/artisan/sign-up"
                  className="text-xs text-royal shrink-0 self-center"
                >
                  Join to claim
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
