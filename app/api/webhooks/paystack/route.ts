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

  if (event.event === "charge.success") {
    const projectId = event.data.metadata?.project_id;
    const reference = event.data.reference;

    if (projectId) {
      const supabase = createServiceClient();

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

  return NextResponse.json({ received: true });
}