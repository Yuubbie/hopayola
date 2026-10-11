import { NextResponse } from "next/server";
import { reply } from "@/lib/bot";
import type { Listing, Session } from "@/lib/types";
import { sanitizeWebsite } from "@/lib/website";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    text?: string;
    session?: Session;
    listings?: Listing[];
  };
  const text = (body.text || "").slice(0, 2000);
  const session = body.session || {};
  session.websiteUrl = sanitizeWebsite(session.websiteUrl);
  if (Array.isArray(body.listings)) {
    session.extraListings = body.listings.slice(0, 40);
  }
  const out = reply(text, session);
  const { extraListings: _drop, ...safeSession } = out.session;
  return NextResponse.json({ text: out.text, session: safeSession });
}
