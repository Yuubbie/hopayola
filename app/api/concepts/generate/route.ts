import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { buildConceptPrompt } from "@/lib/concept-prompt";
import {
  generateFashionImage,
  imageGenMissingMessage,
  imageGenReady,
} from "@/lib/image-gen";

export const maxDuration = 60;

const PLACEHOLDER = "concept-placeholder";

export async function POST(request: Request) {
  if (!imageGenReady()) {
    return NextResponse.json({ error: imageGenMissingMessage() });
  }

  let conceptId = "";
  try {
    const body = await request.json();
    conceptId = String(body?.conceptId || "");
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (!conceptId) {
    return NextResponse.json({ error: "Missing concept." }, { status: 400 });
  }

  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const service = createServiceClient();

  const { data: concept } = await service
    .from("ai_design_concepts")
    .select("*")
    .eq("id", conceptId)
    .maybeSingle();

  if (!concept) {
    return NextResponse.json({ error: "Concept not found." }, { status: 404 });
  }

  const { data: project } = await service
    .from("projects")
    .select("*")
    .eq("id", concept.project_id)
    .maybeSingle();

  if (!project || project.client_id !== user.id) {
    return NextResponse.json({ error: "Not your project." }, { status: 403 });
  }

  if (concept.image_url && !concept.image_url.includes(PLACEHOLDER)) {
    return NextResponse.json({ ok: true, url: concept.image_url });
  }

  const prompt = buildConceptPrompt(project, concept);

  await service
    .from("ai_design_concepts")
    .update({ status: "generating", prompt, error: null })
    .eq("id", conceptId);

  try {
    const image = await generateFashionImage(prompt);
    const ext = image.contentType.includes("jpeg") ? "jpg" : "png";
    const path = `${concept.project_id}/${conceptId}.${ext}`;

    const { error: uploadError } = await service.storage
      .from("concept-images")
      .upload(path, image.bytes, {
        contentType: image.contentType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(
        `Could not store the image: ${uploadError.message}. Run concept-images.sql on Hopayola Supabase.`
      );
    }

    const { data: pub } = service.storage
      .from("concept-images")
      .getPublicUrl(path);

    await service
      .from("ai_design_concepts")
      .update({ image_url: pub.publicUrl, status: "ready", error: null })
      .eq("id", conceptId);

    let url3d: string | null = null;
    if (String(project.tier || "") === "premium") {
      const turnPrompt =
        prompt +
        " Same garment as a 3D-style fashion mockup on a mannequin, three-quarter turnaround view. Visual guide only, not a true fitted 3D garment.";
      const turn = await generateFashionImage(turnPrompt);
      const turnPath = `${concept.project_id}/${conceptId}-3d.${ext}`;
      const { error: turnErr } = await service.storage
        .from("concept-images")
        .upload(turnPath, turn.bytes, {
          contentType: turn.contentType,
          upsert: true,
        });
      if (!turnErr) {
        const { data: turnPub } = service.storage
          .from("concept-images")
          .getPublicUrl(turnPath);
        url3d = turnPub.publicUrl;
        await service
          .from("ai_design_concepts")
          .update({ image_3d_url: url3d })
          .eq("id", conceptId);
      }
    }

    return NextResponse.json({
      ok: true,
      url: pub.publicUrl,
      url3d,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    await service
      .from("ai_design_concepts")
      .update({ status: "failed", error: message })
      .eq("id", conceptId);
    return NextResponse.json({ error: message });
  }
}
