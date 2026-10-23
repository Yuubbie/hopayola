/**
 * Fashion sketches for the design studio.
 * Set IMAGE_GEN_PROVIDER to openai | replicate | fal | custom
 * (or leave blank and we use whichever key is present).
 */

export type ImageBytes = { bytes: Buffer; contentType: string };

function configuredProvider(): string {
  const named = (process.env.IMAGE_GEN_PROVIDER || "").trim().toLowerCase();
  if (named) return named;
  if (process.env.STABILITY_API_KEY) return "stability";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.REPLICATE_API_TOKEN) return "replicate";
  if (process.env.FAL_KEY) return "fal";
  if (process.env.IMAGE_GEN_URL && process.env.IMAGE_GEN_API_KEY) return "custom";
  return "";
}

export function imageGenReady(): boolean {
  return Boolean(configuredProvider());
}

export function imageGenMissingMessage(): string {
  return "Image generation is not configured yet. Add any one of: STABILITY_API_KEY, OPENAI_API_KEY, REPLICATE_API_TOKEN, FAL_KEY, or IMAGE_GEN_URL + IMAGE_GEN_API_KEY. Optional: IMAGE_GEN_PROVIDER=stability|openai|replicate|fal|custom.";
}

async function fromUrl(url: string): Promise<ImageBytes> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not download the generated image.");
  const buf = Buffer.from(await res.arrayBuffer());
  const type = res.headers.get("content-type") || "image/png";
  return { bytes: buf, contentType: type.startsWith("image/") ? type : "image/png" };
}

async function stability(
  prompt: string,
  fabric?: ImageBytes | null
): Promise<ImageBytes> {
  const key = process.env.STABILITY_API_KEY;
  if (!key) throw new Error("STABILITY_API_KEY is missing.");
  const endpoint =
    process.env.STABILITY_IMAGE_URL ||
    "https://api.stability.ai/v2beta/stable-image/generate/core";
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("output_format", "png");
  form.append("aspect_ratio", "2:3");
  if (fabric) {
    const blob = new Blob([new Uint8Array(fabric.bytes)], {
      type: fabric.contentType,
    });
    form.append("image", blob, "fabric.png");
    form.append("strength", "0.65");
  }
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      Accept: "image/*",
    },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stability error (${res.status}): ${text.slice(0, 200)}`);
  }
  const type = res.headers.get("content-type") || "image/png";
  return {
    bytes: Buffer.from(await res.arrayBuffer()),
    contentType: type.startsWith("image/") ? type : "image/png",
  };
}

async function openai(prompt: string): Promise<ImageBytes> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is missing.");
  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size: "1024x1536",
      quality: "medium",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  const url = json?.data?.[0]?.url;
  if (b64) return { bytes: Buffer.from(b64, "base64"), contentType: "image/png" };
  if (url) return fromUrl(url);
  throw new Error("OpenAI returned no image.");
}

async function replicate(prompt: string): Promise<ImageBytes> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN is missing.");
  const model =
    process.env.REPLICATE_IMAGE_MODEL ||
    "black-forest-labs/flux-schnell";
  const res = await fetch("https://api.replicate.com/v1/models/" + model + "/predictions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: JSON.stringify({ input: { prompt } }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Replicate error (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  const out = json.output;
  const url = Array.isArray(out) ? out[0] : out;
  if (!url || typeof url !== "string") throw new Error("Replicate returned no image.");
  return fromUrl(url);
}

async function fal(prompt: string): Promise<ImageBytes> {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY is missing.");
  const model = process.env.FAL_IMAGE_MODEL || "fal-ai/flux/schnell";
  const res = await fetch("https://fal.run/" + model, {
    method: "POST",
    headers: {
      Authorization: "Key " + key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, image_size: "portrait_4_3" }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fal error (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  const url = json?.images?.[0]?.url;
  if (!url) throw new Error("Fal returned no image.");
  return fromUrl(url);
}

async function custom(prompt: string): Promise<ImageBytes> {
  const url = process.env.IMAGE_GEN_URL;
  const key = process.env.IMAGE_GEN_API_KEY;
  if (!url || !key) throw new Error("IMAGE_GEN_URL and IMAGE_GEN_API_KEY are required.");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Custom image API (${res.status}): ${text.slice(0, 200)}`);
  }
  const type = res.headers.get("content-type") || "";
  if (type.startsWith("image/")) {
    return {
      bytes: Buffer.from(await res.arrayBuffer()),
      contentType: type,
    };
  }
  const json = await res.json();
  if (json?.b64 || json?.b64_json) {
    return {
      bytes: Buffer.from(json.b64 || json.b64_json, "base64"),
      contentType: "image/png",
    };
  }
  const imageUrl = json?.url || json?.image_url;
  if (imageUrl) return fromUrl(imageUrl);
  throw new Error("Custom image API returned neither url nor image bytes.");
}

export async function generateFashionImage(
  prompt: string,
  fabric?: ImageBytes | null
): Promise<ImageBytes> {
  const provider = configuredProvider();
  if (!provider) throw new Error(imageGenMissingMessage());
  if (provider === "stability") return stability(prompt, fabric);
  if (provider === "openai") return openai(prompt);
  if (provider === "replicate") return replicate(prompt);
  if (provider === "fal") return fal(prompt);
  if (provider === "custom") return custom(prompt);
  throw new Error(
    `Unknown IMAGE_GEN_PROVIDER "${provider}". Use stability, openai, replicate, fal, or custom.`
  );
}
