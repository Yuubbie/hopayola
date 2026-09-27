"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { runMilestonePayout } from "@/app/actions/paystack-payout";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  return { supabase, user };
}

export async function submitMilestone(formData: FormData) {
  const milestoneId = formData.get("milestoneId") as string;
  const projectId = formData.get("projectId") as string;
  const proofUrl = ((formData.get("proofUrl") as string) || "").trim();

  const { user } = await getUser();
  const service = createServiceClient();

  const { data: assignment } = await service
    .from("project_team_members")
    .select("artisan_id")
    .eq("project_id", projectId)
    .eq("artisan_id", user.id)
    .maybeSingle();

  if (!assignment) {
    throw new Error("You are not assigned to this project.");
  }

  const now = new Date().toISOString();
  const { error } = await service
    .from("project_milestones")
    .update({
      status: "completed",
      submitted_at: now,
      proof_url: proofUrl || null,
      artisan_id: user.id,
    })
    .eq("id", milestoneId)
    .eq("project_id", projectId);

  if (error) throw new Error(error.message);

  await service
    .from("projects")
    .update({ status: "milestone_review" })
    .eq("id", projectId);

  revalidatePath("/artisan/account");
  revalidatePath("/account");
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function confirmMilestone(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const milestoneId = formData.get("milestoneId") as string;
  const projectId = formData.get("projectId") as string;

  const { user } = await getUser();
  const service = createServiceClient();

  const { data: project } = await service
    .from("projects")
    .select("client_id")
    .eq("id", projectId)
    .single();

  if (!project || project.client_id !== user.id) {
    throw new Error("You are not authorized to confirm this milestone.");
  }

  const now = new Date().toISOString();
  const { error } = await service
    .from("project_milestones")
    .update({
      status: "completed",
      confirmed_at: now,
    })
    .eq("id", milestoneId);

  if (error) throw new Error(error.message);

  let payoutMessage: string | null = null;
  try {
    await runMilestonePayout(milestoneId, projectId);
  } catch (err) {
    payoutMessage =
      "Confirmed. Artisan payout is pending. Hopayola will complete it once bank transfers are enabled.";
  }

  revalidatePath("/account");
  revalidatePath("/artisan/account");
  revalidatePath(`/admin/projects/${projectId}`);
  return payoutMessage;
}

export async function disputeMilestone(formData: FormData) {
  const milestoneId = formData.get("milestoneId") as string;
  const projectId = formData.get("projectId") as string;

  const { user } = await getUser();
  const service = createServiceClient();

  const { data: project } = await service
    .from("projects")
    .select("client_id")
    .eq("id", projectId)
    .single();

  if (!project || project.client_id !== user.id) {
    throw new Error("You are not authorized to dispute this milestone.");
  }

  const { error } = await service
    .from("project_milestones")
    .update({
      status: "pending",
      disputed_at: new Date().toISOString(),
    })
    .eq("id", milestoneId)
    .eq("project_id", projectId);

  if (error) throw new Error(error.message);

  revalidatePath("/account");
  revalidatePath("/artisan/account");
  revalidatePath(`/admin/projects/${projectId}`);
}
