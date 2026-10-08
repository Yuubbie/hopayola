"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { runMilestonePayout } from "@/lib/run-milestone-payout";

const GIG = "https://www.giglogistics.com/";
const BOLT = "https://www.bolt.eu/en/send/";

export const COURIER_LINKS = { gig: GIG, bolt: BOLT } as const;

function revalidate(projectId: string) {
  revalidatePath("/account");
  revalidatePath("/artisan/account");
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${projectId}`);
}

async function load() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return { supabase, user, role: profile?.role as string | undefined };
}

export async function clientSendFabric(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const courier = String(formData.get("courier") || "");
  if (courier !== "gig" && courier !== "bolt") {
    throw new Error("Choose GIG or Bolt.");
  }
  const { supabase, user } = await load();
  const { error } = await supabase
    .from("projects")
    .update({
      fabric_sent_at: new Date().toISOString(),
      fabric_courier: courier,
    })
    .eq("id", projectId)
    .eq("client_id", user.id);
  if (error) throw new Error(error.message);
  revalidate(projectId);
}

export async function artisanConfirmFabric(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const { supabase, user, role } = await load();
  if (role !== "artisan" && role !== "admin") throw new Error("Not allowed.");
  if (role === "artisan") {
    const { data: team } = await supabase
      .from("project_team_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("artisan_id", user.id)
      .maybeSingle();
    if (!team) throw new Error("Claim this project first.");
  }
  const { error } = await supabase
    .from("projects")
    .update({
      fabric_received_at: new Date().toISOString(),
      status: "in_production",
    })
    .eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidate(projectId);
}

export async function artisanRequestReview(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const { supabase, role } = await load();
  if (role !== "artisan" && role !== "admin") throw new Error("Not allowed.");
  const { error } = await supabase
    .from("projects")
    .update({ status: "milestone_review" })
    .eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidate(projectId);
}

export async function clientMarkReviewed(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const { supabase, user } = await load();
  const { error } = await supabase
    .from("projects")
    .update({ client_reviewed_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("client_id", user.id);
  if (error) throw new Error(error.message);
  revalidate(projectId);
}

export async function artisanShipProject(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const courier = String(formData.get("courier") || "");
  if (courier !== "gig" && courier !== "bolt") {
    throw new Error("Choose GIG or Bolt.");
  }
  const { supabase, role } = await load();
  if (role !== "artisan" && role !== "admin") throw new Error("Not allowed.");
  const { data: ms } = await supabase
    .from("project_milestones")
    .select("confirmed_at")
    .eq("project_id", projectId);
  if (!ms?.length || ms.some((m) => !m.confirmed_at)) {
    throw new Error("Client must review every milestone before you send the outfit.");
  }
  const { error } = await supabase
    .from("projects")
    .update({
      shipped_at: new Date().toISOString(),
      shipped_courier: courier,
    })
    .eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidate(projectId);
}

export async function clientMarkReceived(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const { supabase, user } = await load();

  const { data: project, error: pErr } = await supabase
    .from("projects")
    .select("id, funded_at, client_id, budget_min, budget_max, funded_subtotal")
    .eq("id", projectId)
    .eq("client_id", user.id)
    .single();
  if (pErr || !project) throw new Error("Project not found.");
  if (!project.funded_at) {
    throw new Error("Pay for the project before marking it received.");
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("projects")
    .update({
      client_received_at: now,
      status: "completed",
    })
    .eq("id", projectId)
    .eq("client_id", user.id);
  if (error) throw new Error(error.message);

  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();
  const { data: milestones } = await service
    .from("project_milestones")
    .select("id, status, confirmed_at, submitted_at")
    .eq("project_id", projectId)
    .order("milestone_order", { ascending: true });

  const payRow = (milestones || []).find((m) => m.status !== "paid" && m.status !== "paid_out");
  if (payRow) {
    const total = Number(
      project.funded_subtotal || project.budget_max || project.budget_min || 0
    );
    await service
      .from("project_milestones")
      .update({
        amount: total,
        funded_at: project.funded_at,
        submitted_at: payRow.submitted_at || now,
        confirmed_at: payRow.confirmed_at || now,
        status: "completed",
      })
      .eq("id", payRow.id);
    await runMilestonePayout(payRow.id, projectId);
  }

  const { data: prof } = await service
    .from("profiles")
    .select("points")
    .eq("id", user.id)
    .maybeSingle();
  await service
    .from("profiles")
    .update({ points: Number(prof?.points || 0) + 50 })
    .eq("id", user.id);

  revalidate(projectId);
  revalidatePath("/lifestyle");
}

export async function seedDefaultMilestones(projectId: string) {
  const { createServiceClient } = await import("@/lib/supabase/service");
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
