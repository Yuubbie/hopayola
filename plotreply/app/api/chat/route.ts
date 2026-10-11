import { NextResponse } from "next/server";
import { reply } from "@/lib/bot";
import type { Session } from "@/lib/types";
import { sanitizeWebsite } from "@/lib/website";

export async function POST(req: Request) {
  const body = (await req.json()) as { text?: string; session?: Session };
  const text = (body.text || "").slice(0, 2000);
  const session = body.session || {};
  session.websiteUrl = sanitizeWebsite(session.websiteUrl);
  const out = reply(text, session);
  return NextResponse.json(out);
}
