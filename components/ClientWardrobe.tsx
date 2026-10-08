import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  addShopWardrobeItem,
  removeShopWardrobeItem,
} from "@/app/actions/wardrobe";

const STATUS: Record<string, string> = {
  submitted: "Brief in",
  concepts_ready: "Choosing a look",
  concept_selected: "Look chosen",
  artisan_assigned: "With artisan",
  in_production: "Being made",
  milestone_review: "In review",
  completed: "In your wardrobe",
  cancelled: "Cancelled",
};

export default async function ClientWardrobe() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="border border-stone rounded-3xl p-10 md:p-14 text-center bg-paper">
        <p className="text-royal text-sm mb-3">Your wardrobe</p>
        <h3 className="font-display text-2xl md:text-3xl mb-4">
          Outfits you make on Hopayola live here.
        </h3>
        <p className="text-ink/60 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Sign in for project pieces, shop buys you add, and points.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/sign-in"
            className="bg-royal text-paper px-6 py-3 rounded-full text-sm hover:bg-royal-deep"
          >
            Sign in
          </Link>
          <Link
            href="/projects/new"
            className="border border-ink/15 px-6 py-3 rounded-full text-sm hover:border-royal hover:text-royal"
          >
            Start a project
          </Link>
        </div>
      </div>
    );
  }

  const [{ data: profile }, { data: projects }, shopRes] = await Promise.all([
    supabase.from("profiles").select("points").eq("id", user.id).maybeSingle(),
    supabase
      .from("projects")
      .select(
        "id, garment_type, occasion, status, created_at, client_received_at"
      )
      .eq("client_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("wardrobe_shop_items")
      .select("id, title, shop_url, created_at")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const pieces = projects || [];
  const shopItems = shopRes.error ? [] : shopRes.data || [];
  const points = Number(profile?.points || 0);

  return (
    <div className="space-y-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-royal text-sm mb-2">Your wardrobe</p>
          <h3 className="font-display text-3xl md:text-4xl">
            Projects and shop pieces
          </h3>
        </div>
        <p className="text-sm text-ink/70">
          <span className="font-medium text-royal">{points}</span> points
        </p>
      </div>

      <div>
        <h4 className="font-display text-xl mb-6">From your projects</h4>
        {pieces.length === 0 ? (
          <p className="text-ink/55 text-sm border border-dashed border-stone rounded-2xl p-10">
            No project pieces yet.{" "}
            <Link href="/projects/new" className="text-royal">
              Start a project
            </Link>
            .
          </p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pieces.map((p) => {
              const done = p.status === "completed" || p.client_received_at;
              return (
                <li
                  key={p.id}
                  className="border border-stone rounded-2xl p-6 bg-paper flex flex-col min-h-[180px]"
                >
                  <p className="text-[11px] uppercase tracking-widest text-royal mb-3">
                    {done
                      ? "In wardrobe"
                      : STATUS[p.status] ||
                        String(p.status).replace(/_/g, " ")}
                  </p>
                  <h4 className="font-display text-xl mb-1">
                    {p.garment_type || "Outfit"}
                  </h4>
                  <p className="text-sm text-ink/55 mb-6">
                    {p.occasion || "Personal project"}
                  </p>
                  <Link href="/account" className="mt-auto text-xs text-royal">
                    Open in account
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <h4 className="font-display text-xl mb-2">From the shop</h4>
        <p className="text-sm text-ink/50 mb-6">
          Shop is WordPress — add a piece you bought so it sits with your
          commissions. Run wardrobe-points.sql in Hopayola Supabase if save
          fails.
        </p>
        <form
          action={addShopWardrobeItem}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          <input
            name="title"
            required
            placeholder="e.g. Croquis sheets"
            className="flex-1 border border-stone rounded-full px-4 py-2.5 text-sm"
          />
          <input
            name="shopUrl"
            placeholder="https://shop.hopayola.com/..."
            className="flex-1 border border-stone rounded-full px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="bg-royal text-paper rounded-full px-5 py-2.5 text-sm"
          >
            Add to wardrobe
          </button>
        </form>
        {shopItems.length === 0 ? (
          <p className="text-xs text-ink/40">No shop pieces added yet.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-4">
            {shopItems.map((s) => (
              <li
                key={s.id}
                className="border border-stone rounded-2xl p-5 flex justify-between gap-3"
              >
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-ink/40 mb-1">
                    Shop
                  </p>
                  <p className="font-medium text-sm">{s.title}</p>
                  {s.shop_url && (
                    <a
                      href={s.shop_url}
                      className="text-xs text-royal"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View in shop
                    </a>
                  )}
                </div>
                <form action={removeShopWardrobeItem}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className="text-xs text-ink/40">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
