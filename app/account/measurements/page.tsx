import { createClient } from "@/lib/supabase/server";
import { saveClientMeasurements } from "@/app/actions/account-profile";

export const metadata = { title: "Measurements — Hopayola" };
export const dynamic = "force-dynamic";

export default async function MeasurementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("saved_measurements")
    .eq("id", user.id)
    .maybeSingle();

  const m = (profile?.saved_measurements || {}) as Record<string, string>;

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-2">Measurements</h1>
      <p className="text-sm text-ink/55 mb-8">
        Generic guide you can update anytime. Attach it on a project so the
        artisan sees the numbers, not your photos.
      </p>

      <form action={saveClientMeasurements} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[
            ["bust", "Bust"],
            ["waist", "Waist"],
            ["hip", "Hip"],
            ["height", "Height"],
            ["shoulder", "Shoulder"],
            ["sleeve", "Sleeve"],
            ["neck", "Neck"],
            ["round_body", "Round body"],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="block text-sm text-ink/50 mb-1" htmlFor={name}>
                {label}
              </label>
              <input
                id={name}
                name={name}
                type="text"
                defaultValue={m[name] || ""}
                className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm text-ink/50 mb-1" htmlFor="notes">
            Fit notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={m.notes || ""}
            placeholder="Long arms, prefers extra ease at the hip..."
            className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-royal text-paper rounded-full px-5 py-2.5 text-sm hover:bg-royal-deep transition-colors"
        >
          Save measurements
        </button>
      </form>
    </div>
  );
}
