"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { runMilestonePayout } from "@/lib/run-milestone-payout";

function revalidate(projectId: string) {
  // "layout" also clears every page nested under the dashboards, so a stage
  // submitted on one side shows up on the other without a hard refresh.
  revalidatePath("/account", "layout");
  revalidatePath("/artisan/account", "layout");
  revalidatePath("/admin", "layout");
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

export async function clientCancelProject(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const { supabase, user } = await load();
  const { data: project } = await supabase
    .from("projects")
    .select("id, funded_at, client_received_at, status")
    .eq("id", projectId)
    .eq("client_id", user.id)
    .maybeSingle();
  if (!project) throw new Error("Project not found.");
  if (project.funded_at) {
    throw new Error("Paid projects cannot be deleted. Contact support.");
  }
  const { error } = await supabase
    .from("projects")
    .update({ status: "cancelled" })
    .eq("id", projectId)
    .eq("client_id", user.id);
  if (error) throw new Error(error.message);
  revalidate(projectId);
  revalidatePath("/lifestyle");
}

export async function artisanConfirmFabric(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const { user, role } = await load();
  if (role !== "artisan" && role !== "admin") throw new Error("Not allowed.");
  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();
  if (role === "artisan") {
    const { data: team } = await service
      .from("project_team_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("artisan_id", user.id)
      .maybeSingle();
    if (!team) throw new Error("Claim this project first.");
  }
  const { error } = await service
    .from("projects")
    .update({
      fabric_received_at: new Date().toISOString(),
      status: "in_production",
    })
    .eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidate(projectId);
}

export async function clientMarkPaid(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const note = String(formData.get("note") || "")
    .trim()
    .slice(0, 300);
  const { supabase, user } = await load();

  const { data: project } = await supabase
    .from("projects")
    .select("id, funded_at, fabric_received_at")
    .eq("id", projectId)
    .eq("client_id", user.id)
    .maybeSingle();

  if (!project) throw new Error("Project not found.");
  if (project.funded_at) return;
  if (!project.fabric_received_at) {
    throw new Error("Wait until your fabric has reached the artisan.");
  }

  const { error } = await supabase
    .from("projects")
    .update({
      client_marked_paid_at: new Date().toISOString(),
      client_marked_paid_note: note || null,
    })
    .eq("id", projectId)
    .eq("client_id", user.id);

  if (error) throw new Error(error.message);
  revalidate(projectId);
}

/**
 * Hopayola confirming money actually arrived. This is the only manual path that
 * sets funded_at, because funded_at is what unlocks artisan payouts.
 */
export async function adminConfirmPayment(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const { user, role } = await load();
  if (role !== "admin") throw new Error("Not allowed.");

  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();

  const { data: project } = await service
    .from("projects")
    .select("id, funded_at, budget_min, budget_max")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) throw new Error("Project not found.");
  if (project.funded_at) return;

  const now = new Date().toISOString();
  const subtotal = Number(project.budget_max || project.budget_min || 0);

  const { error } = await service
    .from("projects")
    .update({
      funded_at: now,
      funded_subtotal: subtotal || null,
      payment_confirmed_at: now,
      payment_confirmed_by: user.id,
    })
    .eq("id", projectId)
    .is("funded_at", null);
  if (error) throw new Error(error.message);

  const { error: msError } = await service
    .from("project_milestones")
    .update({ funded_at: now })
    .eq("project_id", projectId)
    .is("funded_at", null);
  if (msError) throw new Error(msError.message);

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
  const { role } = await load();
  if (role !== "artisan" && role !== "admin") throw new Error("Not allowed.");
  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();
  const { data: ms } = await service
    .from("project_milestones")
    .select("confirmed_at")
    .eq("project_id", projectId);
  if (!ms?.length || ms.some((m) => !m.confirmed_at)) {
    throw new Error("Client must review every milestone before you send the outfit.");
  }
  const { error } = await service
    .from("projects")
    .update({
      shipped_at: new Date().toISOString(),
      shipped_courier: courier,
    })
    .eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidate(projectId);
}

/**
 * One payment per project, and only after the client confirms they have the
 * finished outfit. Milestones are progress checks - no stage is paid on its own.
 * Hopayola holds the money until this point.
 */
async function payProjectOnce(projectId: string) {
  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();

  const { data: project } = await service
    .from("projects")
    .select(
      "id, funded_at, funded_subtotal, budget_min, budget_max, client_received_at"
    )
    .eq("id", projectId)
    .maybeSingle();

  if (!project) throw new Error("Project not found.");
  if (!project.funded_at) throw new Error("The client has not paid yet.");
  if (!project.client_received_at) {
    throw new Error("Wait until the client confirms the finished outfit.");
  }

  const { data: milestones } = await service
    .from("project_milestones")
    .select(
      "id, artisan_id, amount, status, payout_state, submitted_at, confirmed_at"
    )
    .eq("project_id", projectId)
    .order("milestone_order", { ascending: true });

  if (!milestones || milestones.length === 0) {
    throw new Error("Add at least one stage before paying.");
  }

  // Never pay twice, however many times this is called.
  const alreadyPaid = milestones.some(
    (m) =>
      m.status === "paid" ||
      m.status === "paid_out" ||
      m.payout_state === "success"
  );
  if (alreadyPaid) return;

  const total = Number(
    project.funded_subtotal || project.budget_max || project.budget_min || 0
  );
  if (total <= 0) throw new Error("This project has no agreed amount.");

  const groups = new Map<string | null, typeof milestones>();
  for (const m of milestones) {
    const key = (m.artisan_id as string | null) ?? null;
    const list = groups.get(key) || [];
    list.push(m);
    groups.set(key, list);
  }

  const now = new Date().toISOString();

  for (const [artisanId, list] of groups) {
    const share = list.reduce((sum, m) => sum + Number(m.amount || 0), 0);
    const amount = groups.size === 1 ? total : share;

    if (groups.size > 1 && amount <= 0) {
      throw new Error(
        "Set the amount for each artisan's stages before paying a team project."
      );
    }
    if (!artisanId && groups.size > 1) {
      throw new Error(
        "Assign every stage to an artisan before paying a team project."
      );
    }

    const carrier = list[0];
    const { error } = await service
      .from("project_milestones")
      .update({
        amount,
        funded_at: project.funded_at,
        submitted_at: carrier.submitted_at || now,
        confirmed_at: carrier.confirmed_at || now,
        status: "completed",
      })
      .eq("id", carrier.id);
    if (error) throw new Error(error.message);

    try {
      await runMilestonePayout(carrier.id, projectId);
    } catch (err) {
      // The client's side is already done; leave the failure visible to
      // Hopayola on the project page instead of failing their receipt.
      await service
        .from("project_milestones")
        .update({
          payout_error:
            err instanceof Error ? err.message : "Payout could not be started.",
        })
        .eq("id", carrier.id);
    }
  }
}

/** Hopayola retrying the payout from the project page. */
export async function adminSendPayout(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const { role } = await load();
  if (role !== "admin") throw new Error("Not allowed.");

  await payProjectOnce(projectId);
  revalidate(projectId);
}

export async function clientMarkReceived(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const { supabase, user } = await load();

  const { data: project, error: pErr } = await supabase
    .from("projects")
    .select(
      "id, funded_at, client_id, budget_min, budget_max, funded_subtotal, client_received_at"
    )
    .eq("id", projectId)
    .eq("client_id", user.id)
    .single();
  if (pErr || !project) throw new Error("Project not found.");
  if (project.client_received_at) return;
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

  await payProjectOnce(projectId);

  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();
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
