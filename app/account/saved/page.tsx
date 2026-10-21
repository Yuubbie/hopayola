import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteSavedLook } from "@/app/actions/saved-looks";

export const metadata = { title: "Saved items - Hopayola" };
export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("saved_looks")
    .select("id, title, image_url, created_at")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  const looks = error ? [] : data || [];
  const tableMissing = Boolean(error?.message?.match(/saved_looks|schema cache/i));

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl mb-2">Saved items</h1>
      <p className="text-sm text-ink/55 mb-8">
        Looks you keep from the studio. Wardrobe is separate: that is what has
        already been made for you.
      </p>

      {tableMissing && (
        <p className="text-sm text-ink/60 border border-stone rounded-xl px-4 py-3 mb-6">
          Saved looks need one SQL run on Hopayola Supabase (saved-looks.sql).
        </p>
      )}

      {looks.length === 0 && !tableMissing ? (
        <p className="text-sm text-ink/50">
          Nothing saved yet. Open Design studio, download or save a look.
        </p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {looks.map((look) => (
            <li
              key={look.id}
              className="border border-stone rounded-2xl overflow-hidden"
            >
              {look.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={look.image_url}
                  alt=""
                  className="w-full aspect-[4/5] object-cover"
                />
              ) : (
                <div className="aspect-[4/5] bg-stone/40" />
              )}
              <div className="p-3">
                <p className="text-sm mb-3">{look.title}</p>
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href="/projects/new"
                    className="text-xs text-royal underline underline-offset-2"
                  >
                    Start a project
                  </Link>
                  <form action={deleteSavedLook}>
                    <input type="hidden" name="id" value={look.id} />
                    <button type="submit" className="text-xs text-ink/40">
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
