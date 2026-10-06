"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

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
      "id, project_id, status, funded_at, submitted_at, disputed_at, payout_state, artisan_id"
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

  const milestone = await loadMilestone(service, milestoneId, projectId);
  if (isLocked(milestone)) {
    throw new Error("This milestone is already paid or being paid out.");
  }
  if (milestone.artisan_id && milestone.artisan_id !== user.id) {
    throw new Error("This milestone is assigned to another artisan.");
  }

  const { data: assignment } = await service
    .from("project_team_members")
    .select("artisan_id")
    .eq("project_id", projectId)
    .eq("artisan_id", user.id)
    .maybeSingle();

  if (!assignment && milestone.artisan_id !== user.id) {
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

export async function confirmMilestoneReview(formData: FormData) {
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
    throw new Error("You are not authorized to review this milestone.");
  }

  const milestone = await loadMilestone(service, milestoneId, projectId);
  if (isLocked(milestone)) {
    throw new Error("This milestone is already paid.");
  }
  if (!milestone.submitted_at) {
    throw new Error("The artisan has not submitted this milestone yet.");
  }

  const { error } = await service
    .from("project_milestones")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("id", milestoneId)
    .eq("project_id", projectId)
    .neq("status", "paid");

  if (error) throw new Error(error.message);
  refresh(projectId);
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
