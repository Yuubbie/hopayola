import { NextResponse } from "next/server";
import { reply } from "@/lib/bot";

/**
 * Meta Cloud API webhook.
 * Set callback URL to https://YOUR_DOMAIN/api/whatsapp
 * VERIFY_TOKEN must match Meta dashboard.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge || "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const from = message?.from as string | undefined;
  const text = (message?.text?.body as string | undefined) || "";
  const phoneId = body?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id as
    | string
    | undefined;

  if (from && text && phoneId && process.env.WHATSAPP_TOKEN) {
    const { text: out } = reply(text, {});
    await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: out.slice(0, 4000) },
      }),
    }).catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}
