import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const expectedSignature = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  console.info("[paystack webhook]", event.event, event.data?.reference);
  const supabase = createServiceClient();

  if (event.event === "charge.success") {
    const projectId = event.data.metadata?.project_id;
    const reference = event.data.reference;

    if (projectId) {
      await supabase
        .from("projects")
        .update({
          paystack_reference: reference,
          funded_at: new Date().toISOString(),
        })
        .eq("id", projectId)
        .is("funded_at", null);
    }
  }

  if (event.event === "transfer.success" || event.event === "transfer.failed") {
    const reference = event.data?.reference as string | undefined;
    if (reference) {
      await supabase
        .from("project_milestones")
        .update({
          status: event.event === "transfer.success" ? "paid" : "completed",
        })
        .eq("paystack_transfer_reference", reference);
    }
  }

  return NextResponse.json({ received: true });
}
