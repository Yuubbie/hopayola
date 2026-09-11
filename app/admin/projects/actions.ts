"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProjectStatus(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const status = formData.get("status") as string;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "Update ran but changed nothing - likely blocked by a database permission rule."
    );
  }

  revalidatePath("/admin/projects");
}

const PLACEHOLDER_IMAGE = "/images/concept-placeholder.svg";

const PERSONAS = [
  "Modern Minimalist",
  "Classic Elegance",
  "Bold Statement",
  "Romantic Feminine",
  "Contemporary Chic",
  "Cultural Fusion",
  "Avant Garde",
];

const SILHOUETTES = ["Fitted", "A-line", "Draped", "Structured", "Flowing"];
const NECKLINES = ["V-neck", "Round neck", "Off-shoulder", "High neck", "Sweetheart"];
const SLEEVES = ["Sleeveless", "Cap sleeve", "Long sleeve", "Puff sleeve", "Three-quarter"];

export async function generateConcepts(formData: FormData) {
  const projectId = formData.get("projectId") as string;

  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("tier")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    throw new Error(`Could not load project: ${projectError?.message}`);
  }

  const count = project.tier === "premium" ? 7 : 3;

  const concepts = Array.from({ length: count }, (_, i) => ({
    project_id: projectId,
    concept_number: i + 1,
    persona: PERSONAS[i % PERSONAS.length],
    silhouette: SILHOUETTES[i % SILHOUETTES.length],
    modesty_level: i % 2 === 0 ? "Modest" : "Contemporary",
    embellishment: i % 3 === 0 ? "Beaded detail" : "Minimal",
    sleeve_style: SLEEVES[i % SLEEVES.length],
    neckline: NECKLINES[i % NECKLINES.length],
    image_url: PLACEHOLDER_IMAGE,
    is_selected: false,
  }));

  const { error: insertError } = await supabase
    .from("ai_design_concepts")
    .insert(concepts)
    .select();

  if (insertError) {
    throw new Error(`Could not generate concepts: ${insertError.message}`);
  }

  const { data: statusRow, error: statusError } = await supabase
    .from("projects")
    .update({ status: "concepts_ready" })
    .eq("id", projectId)
    .select();

  if (statusError) {
    throw new Error(`Concepts created, but status update failed: ${statusError.message}`);
  }

  if (!statusRow || statusRow.length === 0) {
    throw new Error("Status update was blocked - check permissions.");
  }

  revalidatePath("/admin/projects");
}