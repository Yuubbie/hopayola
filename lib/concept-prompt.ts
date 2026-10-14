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
    `Original fashion design illustration of a ${project?.garment_type || "garment"} for ${project?.occasion || "a special occasion"}, in a contemporary Nigerian fashion context.`,
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
