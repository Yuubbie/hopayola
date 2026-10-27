import { createClient } from "@/lib/supabase/server";
import { saveClientSettings } from "@/app/actions/account-profile";

export const metadata = { title: "Settings — Hopayola" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, style_preferences")
    .eq("id", user.id)
    .maybeSingle();

  const prefs = (profile?.style_preferences || {}) as Record<string, string>;

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-2">Settings</h1>
      <p className="text-sm text-ink/55 mb-8">
        Name, phone and where finished outfits should go.
      </p>

      <form action={saveClientSettings} className="space-y-4">
        <div>
          <label className="block text-sm text-ink/50 mb-1" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            defaultValue={profile?.full_name || ""}
            className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-ink/50 mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            disabled
            value={user.email || ""}
            className="w-full border border-stone rounded-lg px-3 py-2 text-sm bg-stone/40 text-ink/50"
          />
          <p className="text-[11px] text-ink/40 mt-1">
            Sign-in email cannot be changed here.
          </p>
        </div>
        <div>
          <label className="block text-sm text-ink/50 mb-1" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            defaultValue={profile?.phone || ""}
            className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label
            className="block text-sm text-ink/50 mb-1"
            htmlFor="deliveryAddress"
          >
            Delivery address
          </label>
          <textarea
            id="deliveryAddress"
            name="deliveryAddress"
            rows={3}
            defaultValue={prefs.delivery_address || ""}
            placeholder="Abuja address for finished garments"
            className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-royal text-paper rounded-full px-5 py-2.5 text-sm hover:bg-royal-deep transition-colors"
        >
          Save settings
        </button>
      </form>
    </div>
  );
}
