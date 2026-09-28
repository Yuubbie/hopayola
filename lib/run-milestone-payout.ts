import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { artisanPayoutNgn, toKobo, assertPaystackReady } from "@/lib/payments";

const PAYSTACK_BASE = "https://api.paystack.co";

/** Not a server action — only import from trusted server code. */
export async function runMilestonePayout(milestoneId: string, projectId: string) {
  assertPaystackReady();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }

  const supabase = createServiceClient();

  const { data: milestone, error: mErr } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("id", milestoneId)
    .single();

  if (mErr || !milestone) throw new Error("Milestone not found.");
  if (milestone.project_id !== projectId) {
    throw new Error("Milestone does not match this project.");
  }
  if (milestone.status === "paid" || milestone.status === "paid_out") {
    throw new Error("This milestone has already been paid out.");
  }
  if (!milestone.amount || milestone.amount <= 0) {
    throw new Error("This milestone has no amount.");
  }

  let artisanId = milestone.artisan_id as string | null;
  if (!artisanId) {
    const { data: team } = await supabase
      .from("project_team_members")
      .select("artisan_id")
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle();
    artisanId = team?.artisan_id ?? null;
  }

  if (!artisanId) {
    throw new Error("No artisan is assigned to this milestone.");
  }

  const { data: artisanProfile } = await supabase
    .from("artisan_profiles")
    .select("paystack_recipient_code")
    .eq("id", artisanId)
    .single();

  const recipient = artisanProfile?.paystack_recipient_code;
  if (!recipient) {
    throw new Error("Artisan has no verified payout account on file.");
  }

  const payoutNgn = artisanPayoutNgn(Number(milestone.amount));
  const reference = `ms_${milestoneId.replace(/-/g, "").slice(0, 24)}_${Date.now()}`;

  const res = await fetch(`${PAYSTACK_BASE}/transfer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: "balance",
      amount: toKobo(payoutNgn),
      recipient,
      reason: `Hopayola milestone ${milestone.milestone_name}`,
      reference,
    }),
  });

  const json = await res.json();
  if (!json.status) {
    throw new Error(json.message || "Paystack transfer failed.");
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("project_milestones")
    .update({
      status: "paid",
      released_at: now,
      confirmed_at: milestone.confirmed_at || now,
      payout_amount: payoutNgn,
      paystack_transfer_code: json.data?.transfer_code ?? null,
      paystack_transfer_reference: json.data?.reference ?? reference,
      artisan_id: artisanId,
    })
    .eq("id", milestoneId);

  if (error) {
    throw new Error(`Transfer started but ledger update failed: ${error.message}`);
  }

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/account");
  revalidatePath("/artisan/account");
  return { success: true, reference: json.data?.reference ?? reference };
}
