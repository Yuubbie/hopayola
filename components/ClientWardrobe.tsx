import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
          Sign in to see every brief, piece in progress, and finished garment —
          one closet, not scattered chats.
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

  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, garment_type, occasion, status, created_at, client_received_at, fabric_image_urls"
    )
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  const pieces = projects || [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-royal text-sm mb-2">Your wardrobe</p>
          <h3 className="font-display text-3xl md:text-4xl">
            Clothes from your projects
          </h3>
        </div>
        <Link
          href="/projects/new"
          className="text-sm text-royal hover:text-royal-deep"
        >
          Add a new piece
        </Link>
      </div>

      {pieces.length === 0 ? (
        <p className="text-ink/55 text-sm leading-relaxed border border-dashed border-stone rounded-2xl p-10">
          Nothing in the wardrobe yet. Start a project — the garment will appear
          here as it moves from brief to delivered.
        </p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pieces.map((p) => {
            const done = p.status === "completed" || p.client_received_at;
            return (
              <li
                key={p.id}
                className="border border-stone rounded-2xl p-6 bg-paper flex flex-col min-h-[200px]"
              >
                <p className="text-[11px] uppercase tracking-widest text-royal mb-3">
                  {done
                    ? "In wardrobe"
                    : STATUS[p.status] || String(p.status).replace(/_/g, " ")}
                </p>
                <h4 className="font-display text-xl mb-1">
                  {p.garment_type || "Outfit"}
                </h4>
                <p className="text-sm text-ink/55 mb-6">
                  {p.occasion || "Personal project"}
                </p>
                <Link
                  href="/account"
                  className="mt-auto text-xs text-royal"
                >
                  Open in account
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
