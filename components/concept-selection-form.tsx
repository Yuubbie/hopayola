"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
};

type Props = {
  projectId: string;
  concepts: Concept[];
};

export default function ConceptSelectionForm({ projectId, concepts }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      {error && (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-4 py-3 mb-6">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {concepts.map((c) => (
          <div
            key={c.id}
            className="border border-stone rounded-2xl overflow-hidden flex flex-col"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.image_url || "/images/concept-placeholder.svg"}
              alt={`Concept ${c.concept_number}`}
              className="w-full aspect-[4/5] object-cover"
            />

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

              <button
                onClick={() => handleSelect(c.id)}
                disabled={saving !== null}
                className="mt-auto w-full bg-royal text-paper rounded-lg py-2 text-sm hover:bg-royal-deep transition-colors disabled:opacity-50"
              >
                {saving === c.id ? "Selecting..." : "Choose this concept"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}