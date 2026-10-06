"use server";

import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { clientCheckoutTotal, toKobo, assertPaystackReady } from "@/lib/payments";

const PAYSTACK_BASE = "https://api.paystack.co";

export async function initiateProjectPayment(projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("You are not authorized to pay for this project.");
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("client_id, funded_at, fabric_received_at")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    throw new Error("Project not found.");
  }
  if (user.id !== project.client_id) {
    throw new Error("You are not authorized to pay for this project.");
  }
  if (project.funded_at) {
    throw new Error("This project has already been paid for.");
  }
  if (!project.fabric_received_at) {
    throw new Error("Pay after the artisan confirms your fabric has arrived.");
  }

  const { data: milestones, error: milestonesError } = await supabase
    .from("project_milestones")
    .select("amount")
    .eq("project_id", projectId);

  if (milestonesError || !milestones || milestones.length === 0) {
    throw new Error("This project has no milestones set up yet. Contact support.");
  }

  const totalAmount = milestones.reduce(
    (sum, m) => sum + Number(m.amount || 0),
    0
  );
  if (totalAmount <= 0) {
    throw new Error("This project's milestone amounts have not been set yet.");
  }

  assertPaystackReady();

  const amountKobo = toKobo(clientCheckoutTotal(totalAmount));
  const reference =
    "hp_" +
    projectId.replace(/-/g, "").slice(0, 16) +
    "_" +
    crypto.randomBytes(8).toString("hex");

  const service = createServiceClient();
  const { error: saveError } = await service
    .from("projects")
    .update({
      checkout_reference: reference,
      checkout_amount_kobo: amountKobo,
    })
    .eq("id", projectId)
    .is("funded_at", null);

  if (saveError) {
    throw new Error("Could not start payment. Please try again.");
  }

  const res = await fetch(PAYSTACK_BASE + "/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.PAYSTACK_SECRET_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      amount: amountKobo,
      currency: "NGN",
      reference,
      callback_url:
        process.env.NEXT_PUBLIC_SITE_URL +
        "/projects/" +
        projectId +
        "/payment-callback",
      metadata: {
        project_id: projectId,
        milestone_subtotal: totalAmount,
        client_service_fee_rate: 0.05,
      },
    }),
  });

  const json = await res.json();

  if (!json.status) {
    throw new Error(json.message || "Could not start payment. Please try again.");
  }

  return {
    authorizationUrl: json.data.authorization_url as string,
    reference: json.data.reference as string,
  };
}
