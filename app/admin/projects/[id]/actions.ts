"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_STATUS = new Set(["pending", "in_progress", "completed", "paid"]);

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
  return supabase;
}

export async function addMilestone(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const milestoneName = (formData.get("milestoneName") as string)?.trim();
  const amount = formData.get("amount") as string;
  const artisanId = (formData.get("artisanId") as string) || "";

  if (!projectId || !milestoneName) throw new Error("Missing milestone details.");

  const supabase = await requireAdmin();

  const { count } = await supabase
    .from("project_milestones")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  const nextOrder = (count || 0) + 1;

  const { data, error } = await supabase
    .from("project_milestones")
    .insert({
      project_id: projectId,
      milestone_name: milestoneName.slice(0, 120),
      milestone_order: nextOrder,
      amount: amount ? Number(amount) : null,
      status: "pending",
      artisan_id: artisanId || null,
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

  if (!ALLOWED_STATUS.has(status)) {
    throw new Error("Invalid milestone status.");
  }

  const supabase = await requireAdmin();

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
