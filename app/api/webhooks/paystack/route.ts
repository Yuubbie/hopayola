import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { settleTransfer } from "@/lib/payout-core";

const TRANSFER_OUTCOMES: Record<string, "success" | "failed" | "reversed"> = {
  "transfer.success": "success",
  "transfer.failed": "failed",
  "transfer.reversed": "reversed",
};

function validSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!validSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  console.info("[paystack webhook]", event.event, event.data?.reference);
  const supabase = createServiceClient();

  if (event.event === "charge.success") {
    const projectId = event.data?.metadata?.project_id;
    const reference = event.data?.reference;

    if (projectId && event.data?.status === "success") {
      const { error } = await supabase
        .from("projects")
        .update({
          paystack_reference: reference,
          funded_at: new Date().toISOString(),
        })
        .eq("id", projectId)
        .is("funded_at", null);

      if (error) {
        console.error("[paystack webhook] funding update failed", error.message);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }
  }

  const outcome = TRANSFER_OUTCOMES[event.event as string];
  if (outcome) {
    const reference = event.data?.reference as string | undefined;
    if (reference) {
      try {
        await settleTransfer(reference, outcome, event.data?.reason);
      } catch (err) {
        console.error("[paystack webhook] transfer update failed", err);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}