import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { buildConceptPrompt } from "@/lib/concept-prompt";

export const maxDuration = 60;

const PLACEHOLDER = "concept-placeholder";

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({
      error: "Image generation is not configured yet.",
    });
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
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1536",
        quality: "medium",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Image service error (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) throw new Error("The image service returned no image.");

    const bytes = Buffer.from(b64, "base64");
    const path = `${concept.project_id}/${conceptId}.png`;

    const { error: uploadError } = await service.storage
      .from("concept-images")
      .upload(path, bytes, { contentType: "image/png", upsert: true });

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

    return NextResponse.json({ ok: true, url: pub.publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    await service
      .from("ai_design_concepts")
      .update({ status: "failed", error: message })
      .eq("id", conceptId);
    return NextResponse.json({ error: message });
  }
}
