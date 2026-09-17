"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addMilestone(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const milestoneName = formData.get("milestoneName") as string;
  const amount = formData.get("amount") as string;

  const supabase = await createClient();

  const { count } = await supabase
    .from("project_milestones")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  const nextOrder = (count || 0) + 1;

  const { data, error } = await supabase
    .from("project_milestones")
    .insert({
      project_id: projectId,
      milestone_name: milestoneName,
      milestone_order: nextOrder,
      amount: amount ? Number(amount) : null,
      status: "pending",
    })
    .select();

  if (error) {
    throw new Error(`Could not add milestone: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error("Milestone insert was blocked - check permissions.");
  }

  revalidatePath(`/admin/projects/${projectId}`);
}

export async function updateMilestoneStatus(formData: FormData) {
  const milestoneId = formData.get("milestoneId") as string;
  const projectId = formData.get("projectId") as string;
  const status = formData.get("status") as string;

  const supabase = await createClient();

  const updates: Record<string, unknown> = { status };
  if (status === "paid") {
    updates.released_at = new Date().toISOString();
  } else {
    updates.released_at = null;
  }

  const { data, error } = await supabase
    .from("project_milestones")
    .update(updates)
    .eq("id", milestoneId)
    .select();

  if (error) {
    throw new Error(`Could not update milestone: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error("Update was blocked - check permissions.");
  }

  revalidatePath(`/admin/projects/${projectId}`);
}