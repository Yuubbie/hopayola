"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const DASHBOARD = "/artisan/account";

export async function claimProject(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const service = createServiceClient();

  const { data: artisanProfile } = await service
    .from("artisan_profiles")
    .select("specialty")
    .eq("id", user.id)
    .maybeSingle();

  if (!artisanProfile) {
    redirect(`${DASHBOARD}?claim=not_artisan`);
  }

  const { data: project } = await service
    .from("projects")
    .select("id, status")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) {
    redirect(`${DASHBOARD}?claim=missing`);
  }

  const { data: existing } = await service
    .from("project_team_members")
    .select("id")
    .eq("project_id", projectId)
    .eq("artisan_id", user.id)
    .maybeSingle();

  if (existing) {
    revalidatePath(DASHBOARD);
    redirect(`${DASHBOARD}?claim=already`);
  }

  const claimable = ["submitted", "concepts_ready", "concept_selected"];
  if (!claimable.includes(project.status)) {
    redirect(`${DASHBOARD}?claim=taken`);
  }

  const roleOnProject = artisanProfile.specialty?.[0] || "general";

  const { error: teamError } = await service
    .from("project_team_members")
    .insert({
      project_id: projectId,
      artisan_id: user.id,
      role_on_project: roleOnProject,
    });

  if (teamError) {
    redirect(`${DASHBOARD}?claim=failed`);
  }

  await service
    .from("projects")
    .update({ status: "artisan_assigned" })
    .eq("id", projectId);

  revalidatePath(DASHBOARD);
  revalidatePath("/fashion");
  revalidatePath("/fashion/hire-a-talent");
  redirect(`${DASHBOARD}?claim=ok`);
}
