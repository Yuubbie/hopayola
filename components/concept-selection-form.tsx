"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveLook } from "@/app/actions/saved-looks";

type Concept = {
  id: string;
  concept_number: number;
  persona: string | null;
  silhouette: string | null;
  modesty_level: string | null;
  embellishment: string | null;
  sleeve_style: string | null;
  neckline: string | null;
  image_url: string | null;
  image_3d_url?: string | null;
};

type Props = {
  projectId: string;
  concepts: Concept[];
};

const PLACEHOLDER = "/images/concept-placeholder.svg";

function needsImage(c: Concept) {
  return !c.image_url || c.image_url.includes("concept-placeholder");
}

type Phase = "pending" | "generating" | "ready" | "failed";

export default function ConceptSelectionForm({ projectId, concepts }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [ownLooks, setOwnLooks] = useState<Concept[]>([]);
  const [ownBusy, setOwnBusy] = useState(false);

  const [urls, setUrls] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Record<string, Phase>>(() =>
    Object.fromEntries(
      concepts.map((c) => [c.id, needsImage(c) ? "pending" : "ready"])
    )
  );

  const started = useRef(false);

  function setOne(id: string, p: Phase) {
    setPhase((prev) => ({ ...prev, [id]: p }));
  }

  async function generateOne(conceptId: string) {
    setOne(conceptId, "generating");
    try {
      const res = await fetch("/api/concepts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptId }),
      });
      const json = await res.json();
      if (!res.ok || json?.error) {
        setOne(conceptId, "failed");
        return { error: String(json?.error || "Could not generate.") };
      }
      setUrls((prev) => ({ ...prev, [conceptId]: json.url }));
      if (json.url3d) {
        setUrls((prev) => ({ ...prev, [conceptId + "-3d"]: json.url3d }));
      }
      setOne(conceptId, "ready");
      return { ok: true };
    } catch {
      setOne(conceptId, "failed");
      return { error: "Could not reach the image service." };
    }
  }

  async function generateAll() {
    const queue = concepts.filter(needsImage);
    if (queue.length === 0) return;

    for (let i = 0; i < queue.length; i++) {
      const concept = queue[i];
      setNote(`Drawing concept ${i + 1} of ${queue.length}...`);
      const result = await generateOne(concept.id);
      if (result?.error) {
        setNote(result.error);
        if (/not configured/i.test(result.error)) return;
      }
    }
    setNote(null);
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void generateAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelect(conceptId: string) {
    setError(null);
    setSaving(conceptId);

    try {
      const { data: projectRow, error: projectError } = await supabase
        .from("projects")
        .update({
          selected_concept_id: conceptId,
          status: "concept_selected",
        })
        .eq("id", projectId)
        .select();

      if (projectError) {
        throw new Error(`Could not select concept: ${projectError.message}`);
      }
      if (!projectRow || projectRow.length === 0) {
        throw new Error("Selection was blocked - check permissions.");
      }

      await supabase
        .from("ai_design_concepts")
        .update({ is_selected: false })
        .eq("project_id", projectId);

      await supabase
        .from("ai_design_concepts")
        .update({ is_selected: true })
        .eq("id", conceptId);

      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(null);
    }
  }

  async function useMyConcept(file: File) {
    setOwnBusy(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in again.");
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/own-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("project-fabrics")
        .upload(path, file);
      if (upErr) throw new Error(upErr.message);
      const { data: pub } = supabase.storage
        .from("project-fabrics")
        .getPublicUrl(path);
      const n =
        Math.max(
          0,
          ...concepts.map((c) => c.concept_number),
          ...ownLooks.map((c) => c.concept_number)
        ) + 1;
      const { data: row, error: insErr } = await supabase
        .from("ai_design_concepts")
        .insert({
          project_id: projectId,
          concept_number: n,
          persona: "Use my concept",
          image_url: pub.publicUrl,
          is_selected: false,
        })
        .select("id, concept_number, persona, image_url")
        .single();
      if (insErr || !row) throw new Error(insErr?.message || "Could not add look.");
      const added: Concept = {
        id: row.id,
        concept_number: row.concept_number,
        persona: row.persona,
        silhouette: null,
        modesty_level: null,
        embellishment: null,
        sleeve_style: null,
        neckline: null,
        image_url: row.image_url,
      };
      setOwnLooks((prev) => [...prev, added]);
      setPhase((prev) => ({ ...prev, [added.id]: "ready" }));
      setUrls((prev) => ({ ...prev, [added.id]: added.image_url || "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add your picture.");
    }
    setOwnBusy(false);
  }

  const readyCount = concepts.filter((c) => phase[c.id] === "ready").length;
  const allCards = [...concepts, ...ownLooks];

  return (
    <div>
      {error && (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {(note || readyCount < concepts.length) && (
        <p className="text-sm text-ink/60 mb-6">
          {note ||
            `${readyCount} of ${concepts.length} concepts ready. This can take a moment.`}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {allCards.map((c) => {
          const p = phase[c.id];
          const image = urls[c.id] || c.image_url || PLACEHOLDER;
          const image3d = urls[c.id + "-3d"] || c.image_3d_url;
          return (
            <div
              key={c.id}
              className="border border-stone rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/5] bg-stone/20">
                {p === "ready" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={`Concept ${c.concept_number}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center px-4">
                    <span
                      className={`h-6 w-6 rounded-full border-2 border-royal/30 border-t-royal ${
                        p === "generating" ? "animate-spin" : "opacity-40"
                      }`}
                    />
                    <p className="text-xs text-ink/50">
                      {p === "generating"
                        ? "Drawing this concept..."
                        : p === "failed"
                          ? "Could not be drawn"
                          : "Waiting to be drawn"}
                    </p>
                    {p === "failed" && (
                      <button
                        type="button"
                        onClick={async () => {
                          setNote("Trying again...");
                          const r = await generateOne(c.id);
                          setNote(r?.error || null);
                        }}
                        className="text-xs text-royal underline underline-offset-2"
                      >
                        Try again
                      </button>
                    )}
                  </div>
                )}
              </div>
              {image3d && p === "ready" && (
                <div className="border-t border-stone">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image3d}
                    alt={`Concept ${c.concept_number} 3D-style view`}
                    className="w-full aspect-[4/5] object-cover"
                  />
                  <p className="text-[10px] text-ink/45 px-3 py-1">
                    Premium 3D-style mockup. Not a true fitted 3D garment.
                  </p>
                </div>
              )}

              <div className="p-4 flex-1 flex flex-col">
                <p className="text-sm font-medium mb-1">
                  Concept {c.concept_number}
                </p>
                <p className="text-xs text-ink/50 mb-1">{c.persona}</p>
                <p className="text-xs text-ink/50 mb-4">
                  {c.silhouette}
                  {c.neckline ? ` | ${c.neckline}` : ""}
                  {c.sleeve_style ? ` | ${c.sleeve_style}` : ""}
                </p>

                {p === "ready" && image && !String(image).includes("placeholder") && (
                  <div className="mb-2 flex flex-col items-center gap-1">
                    <a
                      href={image}
                      download={`hopayola-concept-${c.concept_number}.png`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-royal underline underline-offset-2"
                    >
                      Download this look
                    </a>
                    <form action={saveLook}>
                      <input type="hidden" name="title" value={`Concept ${c.concept_number}${c.persona ? ` · ${c.persona}` : ""}`} />
                      <input type="hidden" name="imageUrl" value={image} />
                      <input type="hidden" name="projectId" value={projectId} />
                      <input type="hidden" name="conceptId" value={c.id} />
                      <button
                        type="submit"
                        className="text-xs text-ink/50 hover:text-royal"
                      >
                        Save to my items
                      </button>
                    </form>
                  </div>
                )}
                <button
                  onClick={() => handleSelect(c.id)}
                  disabled={saving !== null || p !== "ready"}
                  className="mt-auto w-full bg-royal text-paper rounded-lg py-2 text-sm hover:bg-royal-deep transition-colors disabled:opacity-50"
                >
                  {saving === c.id
                    ? "Selecting..."
                    : p === "ready"
                      ? "Choose this concept"
                      : "Please wait..."}
                </button>
              </div>
            </div>
          );
        })}
        <div className="border border-dashed border-stone rounded-2xl p-4 flex flex-col justify-center">
          <p className="text-sm font-medium mb-1">Use my concept</p>
          <p className="text-xs text-ink/50 mb-3">
            Upload your own picture. It appears in this pocket so you can
            choose it like the others.
          </p>
          <input
            type="file"
            accept="image/*"
            disabled={ownBusy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void useMyConcept(f);
            }}
            className="text-xs"
          />
          {ownBusy && (
            <p className="text-xs text-ink/50 mt-2">Adding your look...</p>
          )}
        </div>
      </div>
    </div>
  );
}
