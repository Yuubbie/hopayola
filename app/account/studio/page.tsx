import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Design studio — Hopayola" };
export const dynamic = "force-dynamic";

export default async function DesignStudioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: projects } = await supabase
    .from("projects")
    .select("id, garment_type, occasion, status, selected_concept_id, created_at")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  const list = projects || [];
  const waiting = list.filter(
    (p) =>
      !p.selected_concept_id &&
      p.status !== "cancelled" &&
      p.status !== "completed"
  );

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl mb-2">Design studio</h1>
      <p className="text-sm text-ink/55 mb-8 leading-relaxed">
        Send fabric and the occasion. Hopayola draws a few looks from that
        brief. You pick one. That choice is what the artisan sews — not a mood
        board.
      </p>

      <Link
        href="/projects/new"
        className="inline-block bg-royal text-paper rounded-full px-5 py-2.5 text-sm hover:bg-royal-deep transition-colors mb-10"
      >
        Start a brief
      </Link>

      <h2 className="font-display text-xl mb-4">Your concepts</h2>
      {waiting.length === 0 ? (
        <p className="text-sm text-ink/50">
          No open briefs waiting for a look. Start one, then come back here to
          choose.
        </p>
      ) : (
        <ul className="space-y-3">
          {waiting.map((p) => (
            <li
              key={p.id}
              className="border border-stone rounded-2xl p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium text-sm">
                  {p.garment_type || "Project"}
                  {p.occasion ? ` — ${p.occasion}` : ""}
                </p>
                <p className="text-[11px] text-ink/45 mt-1">
                  {p.status === "concepts_ready"
                    ? "Looks are ready to choose"
                    : "Brief received — open to see or wait for drawings"}
                </p>
              </div>
              <Link
                href={`/projects/${p.id}/concepts`}
                className="shrink-0 text-xs bg-royal text-paper rounded-full px-3 py-1.5"
              >
                Open studio
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
