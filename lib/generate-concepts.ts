import { createServiceClient } from "@/lib/supabase/service";

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

export async function generateConceptsForProject(
  projectId: string,
  tier: string
) {
  const service = createServiceClient();
  const { count } = await service
    .from("ai_design_concepts")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);
  if ((count || 0) > 0) return;

  const n = tier === "premium" ? 7 : 3;
  const concepts = Array.from({ length: n }, (_, i) => ({
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

  await service.from("ai_design_concepts").insert(concepts);
  await service
    .from("projects")
    .update({ status: "concepts_ready" })
    .eq("id", projectId);
}
