import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setArtisanVerified } from "./actions";

export default async function AdminArtisans() {
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

  const { data: artisans } = await supabase
    .from("artisan_profiles")
    .select("id, region, specialty, skills, years_experience, bio, verified, profiles(full_name)")
    .order("id", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-display text-3xl mb-2">Artisans</h1>
      <p className="text-ink/60 mb-12">
        Review and verify artisans before they can claim client projects.
      </p>

      {!artisans || artisans.length === 0 ? (
        <p className="text-ink/50 text-sm">No artisans have signed up yet.</p>
      ) : (
        <ul className="space-y-4">
          {artisans.map((a: any) => (
            <li key={a.id} className="border border-stone rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="font-medium text-sm block">
                    {a.profiles?.full_name || "Unknown"}
                  </span>
                  <span className="text-ink/50 text-xs capitalize">
                    {a.region} - {a.years_experience ?? "?"} yrs experience
                  </span>
                </div>
                <span
                  className={`shrink-0 text-xs rounded-full px-3 py-1 ${
                    a.verified
                      ? "bg-royal text-paper"
                      : "border border-stone text-ink/60"
                  }`}
                >
                  {a.verified ? "Verified" : "Pending review"}
                </span>
              </div>

              {a.specialty && a.specialty.length > 0 && (
                <p className="text-sm text-ink/70 mb-1">
                  <span className="text-ink/40">Specialty: </span>
                  {a.specialty.join(", ")}
                </p>
              )}
              {a.skills && a.skills.length > 0 && (
                <p className="text-sm text-ink/70 mb-1">
                  <span className="text-ink/40">Skills: </span>
                  {a.skills.join(", ")}
                </p>
              )}
              {a.bio && (
                <p className="text-sm text-ink/70 mb-3">{a.bio}</p>
              )}

              <form action={setArtisanVerified} className="mt-3">
                <input type="hidden" name="artisanId" value={a.id} />
                <input
                  type="hidden"
                  name="verified"
                  value={(!a.verified).toString()}
                />
                <button
                  type="submit"
                  className={`text-sm rounded-lg px-4 py-1.5 transition-colors ${
                    a.verified
                      ? "border border-stone hover:border-ink"
                      : "bg-royal text-paper hover:bg-royal-deep"
                  }`}
                >
                  {a.verified ? "Revoke verification" : "Verify artisan"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}