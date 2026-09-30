import { createServiceClient } from "@/lib/supabase/service";
import { clientCheckoutTotal, toKobo } from "@/lib/payments";

export type FundResult = { ok: true } | { ok: false; reason: string };

export async function fundProjectFromPayment(input: {
  projectId: string;
  reference: string;
  amountKobo: number;
  currency: string;
  status: string;
}): Promise<FundResult> {
  const { projectId, reference, amountKobo, currency, status } = input;

  if (status !== "success") {
    return { ok: false, reason: "Payment was not successful." };
  }
  if (currency !== "NGN") {
    return { ok: false, reason: "Unexpected currency: " + currency };
  }

  const supabase = createServiceClient();

  const { data: project, error: pErr } = await supabase
    .from("projects")
    .select("id, funded_at, checkout_reference, checkout_amount_kobo")
    .eq("id", projectId)
    .maybeSingle();

  if (pErr) throw new Error(pErr.message);
  if (!project) return { ok: false, reason: "Project not found." };

  if (project.funded_at) return { ok: true };

  if (!project.checkout_reference || project.checkout_reference !== reference) {
    return { ok: false, reason: "Payment reference does not match checkout." };
  }
  const expectedKobo = Number(project.checkout_amount_kobo);
  if (!expectedKobo || expectedKobo !== Number(amountKobo)) {
    return { ok: false, reason: "Amount paid does not match amount expected." };
  }

  const { data: milestones, error: mErr } = await supabase
    .from("project_milestones")
    .select("amount")
    .eq("project_id", projectId);

  if (mErr) throw new Error(mErr.message);

  const subtotal = (milestones ?? []).reduce(
    (sum, m) => sum + Number(m.amount || 0),
    0
  );
  if (subtotal <= 0 || toKobo(clientCheckoutTotal(subtotal)) !== expectedKobo) {
    return { ok: false, reason: "Milestones changed after checkout." };
  }

  const now = new Date().toISOString();

  const { error: msErr } = await supabase
    .from("project_milestones")
    .update({ funded_at: now })
    .eq("project_id", projectId)
    .is("funded_at", null);
  if (msErr) throw new Error(msErr.message);

  const { error: upErr } = await supabase
    .from("projects")
    .update({
      paystack_reference: reference,
      funded_at: now,
      funded_amount_kobo: Number(amountKobo),
      funded_subtotal: subtotal,
    })
    .eq("id", projectId)
    .is("funded_at", null);
  if (upErr) throw new Error(upErr.message);

  return { ok: true };
}