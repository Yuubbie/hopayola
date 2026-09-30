import { createServiceClient } from "@/lib/supabase/service";
import { artisanPayoutNgn, toKobo, assertPaystackReady } from "@/lib/payments";

const PAYSTACK_BASE = "https://api.paystack.co";

export async function claimAndPayout(milestoneId: string, projectId: string) {
  assertPaystackReady();
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not set.");
  }
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
  if (milestone.status === "paid") {
    throw new Error("This milestone has already been paid out.");
  }
  if (!milestone.amount || Number(milestone.amount) <= 0) {
    throw new Error("This milestone has no amount.");
  }
  if (!milestone.funded_at) {
    throw new Error("The client has not funded this milestone.");
  }
  if (!milestone.submitted_at) {
    throw new Error("The artisan has not submitted this milestone.");
  }
  if (milestone.disputed_at) {
    throw new Error("This milestone is disputed and cannot be paid.");
  }
  const st = milestone.payout_state as string | null;
  if (st === "claimed" || st === "pending" || st === "success") {
    throw new Error("A payout for this milestone is already in progress or done.");
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
  if (!artisanId) throw new Error("No artisan is assigned to this milestone.");

  const { data: artisanProfile } = await supabase
    .from("artisan_profiles")
    .select("paystack_recipient_code")
    .eq("id", artisanId)
    .single();

  const recipient = artisanProfile?.paystack_recipient_code;
  if (!recipient) {
    throw new Error("Artisan has no verified payout account on file.");
  }

  const currentAttempts =
    milestone.payout_attempts === null || milestone.payout_attempts === undefined
      ? null
      : Number(milestone.payout_attempts);
  const attempt = (currentAttempts ?? 0) + 1;
  const now = new Date().toISOString();

  let claimQuery = supabase
    .from("project_milestones")
    .update({
      payout_state: "claimed",
      payout_claimed_at: now,
      payout_attempts: attempt,
      payout_error: null,
      artisan_id: artisanId,
    })
    .eq("id", milestoneId)
    .neq("status", "paid")
    .not("funded_at", "is", null)
    .not("submitted_at", "is", null)
    .is("disputed_at", null)
    .or(
      "payout_state.is.null,payout_state.eq.none,payout_state.eq.failed,payout_state.eq.reversed"
    );

  claimQuery =
    currentAttempts === null
      ? claimQuery.is("payout_attempts", null)
      : claimQuery.eq("payout_attempts", currentAttempts);

  const { data: claimed, error: claimErr } = await claimQuery
    .select("id")
    .maybeSingle();

  if (claimErr) throw new Error("Could not claim payout: " + claimErr.message);
  if (!claimed) {
    throw new Error("Another payout attempt got there first. Nothing was sent.");
  }

  const payoutNgn = artisanPayoutNgn(Number(milestone.amount));
  const reference = "ms_" + milestoneId.replace(/-/g, "") + "_a" + attempt;

  let json: any;
  try {
    const res = await fetch(PAYSTACK_BASE + "/transfer", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.PAYSTACK_SECRET_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: toKobo(payoutNgn),
        recipient,
        reason: "Hopayola milestone " + (milestone.milestone_name ?? ""),
        reference,
      }),
    });
    json = await res.json();
  } catch (err) {
    await supabase
      .from("project_milestones")
      .update({
        paystack_transfer_reference: reference,
        payout_error:
          "Network error while sending. Check Paystack for reference " + reference,
      })
      .eq("id", milestoneId);
    throw new Error(
      "Could not confirm whether the transfer was sent. Check Paystack before retrying."
    );
  }

  if (!json.status) {
    const msg = json.message || "Paystack transfer failed.";
    await supabase
      .from("project_milestones")
      .update({ payout_state: "failed", payout_error: msg })
      .eq("id", milestoneId);
    throw new Error(msg);
  }

  const tStatus = String(json.data?.status || "pending");
  const isSuccess = tStatus === "success";
  const done = new Date().toISOString();

  const update: Record<string, unknown> = {
    payout_state: isSuccess ? "success" : "pending",
    payout_amount: payoutNgn,
    paystack_transfer_code: json.data?.transfer_code ?? null,
    paystack_transfer_reference: json.data?.reference ?? reference,
    payout_error: null,
  };
  if (isSuccess) {
    update.status = "paid";
    update.released_at = done;
  }

  const { error: upErr } = await supabase
    .from("project_milestones")
    .update(update)
    .eq("id", milestoneId);

  if (upErr) {
    throw new Error(
      "Transfer started but ledger update failed: " + upErr.message
    );
  }

  return {
    success: true,
    reference: json.data?.reference ?? reference,
    state: isSuccess ? "success" : "pending",
  };
}

export async function settleTransfer(
  reference: string,
  outcome: "success" | "failed" | "reversed",
  reason?: string
) {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  if (outcome === "success") {
    const { error } = await supabase
      .from("project_milestones")
      .update({
        status: "paid",
        payout_state: "success",
        released_at: now,
        payout_error: null,
      })
      .eq("paystack_transfer_reference", reference);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase
    .from("project_milestones")
    .update({
      status: "completed",
      payout_state: outcome,
      payout_error: reason || "Transfer " + outcome,
    })
    .eq("paystack_transfer_reference", reference);
  if (error) throw new Error(error.message);
}