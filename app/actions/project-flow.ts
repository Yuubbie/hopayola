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
    .select("id, funded_at, client_id")
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

  const { data: milestones } = await supabase
    .from("project_milestones")
    .select("id, status, confirmed_at")
    .eq("project_id", projectId);

  for (const m of milestones || []) {
    if (m.status === "paid" || m.status === "paid_out") continue;
    if (!m.confirmed_at) {
      await supabase
        .from("project_milestones")
        .update({ confirmed_at: now, status: "completed" })
        .eq("id", m.id);
    }
    await runMilestonePayout(m.id, projectId);
  }

  revalidate(projectId);
}
