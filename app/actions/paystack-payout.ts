"use server";

import { createClient } from "@/lib/supabase/server";
import { runMilestonePayout } from "@/lib/run-milestone-payout";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Not authorized.");
  return user;
}

export async function payoutMilestone(milestoneId: string, projectId: string) {
  await requireAdmin();
  return runMilestonePayout(milestoneId, projectId);
}

export async function payoutMilestoneForm(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const milestoneId = formData.get("milestoneId") as string;
  const projectId = formData.get("projectId") as string;
  try {
    await payoutMilestone(milestoneId, projectId);
    return null;
  } catch (err) {
    return err instanceof Error
      ? err.message
      : "Payout could not be sent. Try again later.";
  }
}