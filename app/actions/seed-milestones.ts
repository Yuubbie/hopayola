"use server";

import { createServiceClient } from "@/lib/supabase/service";

export async function seedDefaultMilestones(projectId: string) {
  const service = createServiceClient();
  const { count } = await service
    .from("project_milestones")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);
  if ((count || 0) > 0) return;
  await service.from("project_milestones").insert([
    {
      project_id: projectId,
      milestone_name: "Milestone 1",
      milestone_order: 1,
      status: "pending",
    },
    {
      project_id: projectId,
      milestone_name: "Milestone 2",
      milestone_order: 2,
      status: "pending",
    },
    {
      project_id: projectId,
      milestone_name: "Milestone 3",
      milestone_order: 3,
      status: "pending",
    },
  ]);
}
