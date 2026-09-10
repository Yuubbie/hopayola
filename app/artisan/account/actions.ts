"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function claimProject(formData: FormData) {
  const projectId = formData.get("projectId") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not signed in.");
  }

  const { data: artisanProfile } = await supabase
    .from("artisan_profiles")
    .select("specialty")
    .eq("id", user.id)
    .single();

  const roleOnProject = artisanProfile?.specialty?.[0] || "general";

  const { data: teamRow, error: teamError } = await supabase
    .from("project_team_members")
    .insert({
      project_id: projectId,
      artisan_id: user.id,
      role_on_project: roleOnProject,
    })
    .select();

  if (teamError) {
    throw new Error(`Could not claim project: ${teamError.message}`);
  }

  if (!teamRow || teamRow.length === 0) {
    throw new Error("Claim was blocked - this project may already be taken.");
  }

  const { data: statusRow, error: statusError } = await supabase
    .from("projects")
    .update({ status: "artisan_assigned" })
    .eq("id", projectId)
    .select();

  if (statusError) {
    throw new Error(`Claimed, but could not update status: ${statusError.message}`);
  }

  if (!statusRow || statusRow.length === 0) {
    throw new Error("Status update was blocked - someone may have claimed this first.");
  }

  revalidatePath("/artisan/account");
}