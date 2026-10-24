"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

async function clientProject(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const service = createServiceClient();
  const { data: project } = await service
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("client_id", user.id)
    .maybeSingle();
  if (!project) throw new Error("Project not found.");
  return { user, service, project };
}

export async function rateArtisan(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const rating = Number(formData.get("rating") || 0);
  const review = String(formData.get("review") || "").trim();
  if (rating < 1 || rating > 5) throw new Error("Pick 1 to 5.");
  const { service, project } = await clientProject(projectId);
  if (!project.client_received_at) {
    throw new Error("Rate after you mark the outfit received.");
  }
  await service
    .from("projects")
    .update({ artisan_rating: rating, artisan_review: review || null })
    .eq("id", projectId);
  revalidatePath(`/account/projects/${projectId}`);
}

export async function requestRework(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const note = String(formData.get("note") || "").trim();
  const extend = String(formData.get("extend") || "") === "yes";
  const { service, project } = await clientProject(projectId);
  if (!project.client_received_at && !project.shipped_at) {
    throw new Error("Rework is after the outfit has been sent.");
  }
  let deadline = project.delivery_deadline;
  if (extend && deadline) {
    const d = new Date(deadline);
    d.setDate(d.getDate() + 14);
    deadline = d.toISOString();
  }
  await service
    .from("projects")
    .update({
      rework_requested_at: new Date().toISOString(),
      rework_note: note || "More detailing requested",
      shipped_at: null,
      client_received_at: null,
      status: "in_production",
      delivery_deadline: deadline,
    })
    .eq("id", projectId);
  revalidatePath(`/account/projects/${projectId}`);
  revalidatePath("/artisan/account");
}

export async function submitTrendingPhoto(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const file = formData.get("photo") as File | null;
  if (!file || !file.size) throw new Error("Choose a photo.");
  const { user, service, project } = await clientProject(projectId);
  if (!project.client_received_at) {
    throw new Error("Upload after you receive the outfit.");
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${user.id}/trending-${projectId}.${ext}`;
  const { error } = await service.storage
    .from("project-fabrics")
    .upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  await service
    .from("projects")
    .update({ trending_photo_path: path })
    .eq("id", projectId);
  revalidatePath(`/account/projects/${projectId}`);
}
