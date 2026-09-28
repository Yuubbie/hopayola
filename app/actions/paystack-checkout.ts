"use server";

import { createClient } from "@/lib/supabase/server";
import { clientCheckoutTotal, toKobo, assertPaystackReady } from "@/lib/payments";

const PAYSTACK_BASE = "https://api.paystack.co";

export async function initiateProjectPayment(projectId: string) {
  const supabase = await createClient();

  const { data: milestones, error: milestonesError } = await supabase
    .from("project_milestones")
    .select("amount")
    .eq("project_id", projectId);

  if (milestonesError || !milestones || milestones.length === 0) {
    throw new Error("This project has no milestones set up yet. Contact support.");
  }

  const totalAmount = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);

  if (totalAmount <= 0) {
    throw new Error("This project's milestone amounts have not been set yet.");
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("client_id, funded_at")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    throw new Error("Project not found.");
  }

  if (project.funded_at) {
    throw new Error("This project has already been paid for.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== project.client_id) {
    throw new Error("You are not authorized to pay for this project.");
  }

  assertPaystackReady();

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      amount: toKobo(clientCheckoutTotal(totalAmount)),
      currency: "NGN",
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/projects/${projectId}/payment-callback`,
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
