type ProjectLike = {
  garment_type?: string | null;
  occasion?: string | null;
  style_direction?: string | null;
  measurements?: Record<string, unknown> | null;
};

type ConceptLike = {
  persona?: string | null;
  silhouette?: string | null;
  modesty_level?: string | null;
  embellishment?: string | null;
  sleeve_style?: string | null;
  neckline?: string | null;
};

export function buildConceptPrompt(
  project: ProjectLike | null,
  concept: ConceptLike
) {
  const m = (project?.measurements || {}) as Record<string, unknown>;
  const val = (k: string) => {
    const v = m[k];
    return v === null || v === undefined || v === "" ? null : String(v);
  };

  const notes = String(project?.style_direction || "");
  const blob = `${notes} ${project?.garment_type || ""}`.toLowerCase();
  const womenswear =
    blob.includes("womenswear") ||
    blob.includes("jewellery") ||
    blob.includes("jewelry");
  const menswear = !womenswear && blob.includes("menswear");
  const fabricNote = /fabric type:|aso-oke|ankara|adire|lace|uploaded/i.test(
    notes
  );

  const direction = [
    concept.persona,
    concept.silhouette ? `${concept.silhouette} silhouette` : null,
    concept.neckline,
    concept.sleeve_style ? `${concept.sleeve_style} sleeves` : null,
    concept.embellishment,
    concept.modesty_level ? `${concept.modesty_level} styling` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const proportions = [
    val("bust") && `bust ${val("bust")}`,
    val("waist") && `waist ${val("waist")}`,
    val("hip") && `hip ${val("hip")}`,
    val("height") && `height ${val("height")}`,
  ]
    .filter(Boolean)
    .join(", ");

  return [
    menswear
      ? `Original menswear fashion design of a ${project?.garment_type || "garment"} for ${project?.occasion || "a special occasion"}, contemporary Nigerian fashion. Full-length adult man only. No women, no female model, no gown.`
      : `Original womenswear fashion design of a ${project?.garment_type || "garment"} for ${project?.occasion || "a special occasion"}, contemporary Nigerian fashion. Full-length adult woman only. No men, no male model.`,
    fabricNote
      ? "The garment textile must match the client's uploaded fabric photo: same print, colour and weave. Do not invent a different fabric."
      : null,
    direction ? `Design direction: ${direction}.` : null,
    proportions ? `Figure proportions to respect: ${proportions}.` : null,
    project?.style_direction
      ? `Client style notes: ${project.style_direction}.`
      : null,
    val("notes") ? `Fit notes: ${val("notes")}.` : null,
    "Style: elegant hand-drawn marker and ink fashion croquis, full-length figure, front view, confident clean linework, soft fabric shading, plain warm off-white paper background.",
    "Do not include any text, watermark, signature, logo, brand name, or recognisable real person.",
  ]
    .filter(Boolean)
    .join(" ");
}
