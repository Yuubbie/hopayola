import { createServiceClient } from "@/lib/supabase/service";
import { PERSONA_MEN, PERSONA_WOMEN } from "@/lib/studio-looks";

const WOMEN_SILHOUETTES = ["Fitted", "A-line", "Draped", "Structured", "Flowing"];
const WOMEN_NECKLINES = [
  "V-neck",
  "Round neck",
  "Off-shoulder",
  "High neck",
  "Sweetheart",
];
const WOMEN_SLEEVES = [
  "Sleeveless",
  "Cap sleeve",
  "Long sleeve",
  "Puff sleeve",
  "Three-quarter",
];

const MEN_SILHOUETTES = ["Structured", "Straight", "Relaxed", "Flowing", "Fitted"];
const MEN_NECKLINES = [
  "Round neck",
  "Mandarin collar",
  "V-neck",
  "Crew neck",
  "High neck",
];
const MEN_SLEEVES = [
  "Long sleeve",
  "Three-quarter",
  "Short sleeve",
  "Cap sleeve",
  "Long sleeve",
];

function isMenswear(style: string | null, garment: string | null) {
  const t = `${style || ""} ${garment || ""}`.toLowerCase();
  if (
    t.includes("womenswear") ||
    t.includes("jewellery") ||
    t.includes("jewelry")
  ) {
    return false;
  }
  return t.includes("menswear");
}

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

  const { data: project } = await service
    .from("projects")
    .select("style_direction, garment_type")
    .eq("id", projectId)
    .maybeSingle();

  const male = isMenswear(
    project?.style_direction || null,
    project?.garment_type || null
  );
  const personas = male ? PERSONA_MEN : PERSONA_WOMEN;
  const silhouettes = male ? MEN_SILHOUETTES : WOMEN_SILHOUETTES;
  const necklines = male ? MEN_NECKLINES : WOMEN_NECKLINES;
  const sleeves = male ? MEN_SLEEVES : WOMEN_SLEEVES;

  const n = tier === "premium" ? 7 : 3;
  const concepts = Array.from({ length: n }, (_, i) => ({
    project_id: projectId,
    concept_number: i + 1,
    persona: personas[i % personas.length],
    silhouette: silhouettes[i % silhouettes.length],
    modesty_level: i % 2 === 0 ? "Modest" : "Contemporary",
    embellishment: i % 3 === 0 ? "Beaded detail" : "Minimal",
    sleeve_style: sleeves[i % sleeves.length],
    neckline: necklines[i % necklines.length],
    image_url: null,
    is_selected: false,
  }));

  await service.from("ai_design_concepts").insert(concepts);
  await service
    .from("projects")
    .update({ status: "concepts_ready" })
    .eq("id", projectId);
}
