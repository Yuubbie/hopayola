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

async function loadMilestone(
  service: ReturnType<typeof createServiceClient>,
  milestoneId: string,
  projectId: string
) {
  const { data, error } = await service
    .from("project_milestones")
    .select(
      "id, project_id, status, funded_at, submitted_at, disputed_at, payout_state"
    )
    .eq("id", milestoneId)
    .eq("project_id", projectId)
    .maybeSingle();
  if (error || !data) throw new Error("Milestone not found.");
  return data;
}

function isLocked(m: { status: string | null; payout_state: string | null }) {
  const st = m.payout_state ?? "";
  return (
    m.status === "paid" ||
    st === "claimed" ||
    st === "pending" ||
    st === "success"
  );
}

function refresh(projectId: string) {
  revalidatePath("/account");
  revalidatePath("/artisan/account");
  revalidatePath("/admin/projects/" + projectId);
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

  const milestone = await loadMilestone(service, milestoneId, projectId);
  if (isLocked(milestone)) {
    throw new Error("This milestone is already paid or being paid out.");
  }

  const now = new Date().toISOString();
  const { error } = await service
    .from("project_milestones")
    .update({
      status: "completed",
      submitted_at: now,
      proof_url: proofUrl || null,
      artisan_id: user.id,
      confirmed_at: null,
      disputed_at: null,
    })
    .eq("id", milestoneId)
    .eq("project_id", projectId)
    .neq("status", "paid");

  if (error) throw new Error(error.message);

  await service
    .from("projects")
    .update({ status: "milestone_review" })
    .eq("id", projectId);

  refresh(projectId);
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
    return "You are not authorized to confirm this milestone.";
  }

  let milestone;
  try {
    milestone = await loadMilestone(service, milestoneId, projectId);
  } catch (err) {
    return "Milestone not found.";
  }

  if (isLocked(milestone)) {
    return "This milestone is already paid or being paid out.";
  }
  if (!milestone.funded_at) {
    return "This milestone has not been funded yet.";
  }
  if (!milestone.submitted_at) {
    return "The artisan has not submitted this milestone yet.";
  }
  if (milestone.disputed_at) {
    return "This milestone is disputed and cannot be confirmed.";
  }

  const now = new Date().toISOString();
  const { error } = await service
    .from("project_milestones")
    .update({ confirmed_at: now })
    .eq("id", milestoneId)
    .eq("project_id", projectId)
    .neq("status", "paid");

  if (error) return "Could not confirm: " + error.message;

  let payoutMessage: string | null = null;
  try {
    await runMilestonePayout(milestoneId, projectId);
  } catch (err) {
    payoutMessage =
      "Confirmed. Artisan payout is pending. Hopayola will complete it shortly.";
  }

  refresh(projectId);
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

  const milestone = await loadMilestone(service, milestoneId, projectId);
  if (isLocked(milestone)) {
    throw new Error("This milestone is already paid or being paid out.");
  }

  const { error } = await service
    .from("project_milestones")
    .update({
      status: "pending",
      disputed_at: new Date().toISOString(),
      confirmed_at: null,
    })
    .eq("id", milestoneId)
    .eq("project_id", projectId)
    .neq("status", "paid");

  if (error) throw new Error(error.message);

  refresh(projectId);
}