"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function me() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  return { supabase, user };
}

export async function saveClientMeasurements(formData: FormData) {
  const { supabase, user } = await me();
  const measurements = {
    bust: String(formData.get("bust") || "").trim() || null,
    waist: String(formData.get("waist") || "").trim() || null,
    hip: String(formData.get("hip") || "").trim() || null,
    height: String(formData.get("height") || "").trim() || null,
    shoulder: String(formData.get("shoulder") || "").trim() || null,
    sleeve: String(formData.get("sleeve") || "").trim() || null,
    neck: String(formData.get("neck") || "").trim() || null,
    round_body: String(formData.get("round_body") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  };

  const { error } = await supabase
    .from("profiles")
    .update({
      saved_measurements: measurements,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/account", "layout");
  revalidatePath("/projects/new");
}

export async function attachMeasurementsToProject(formData: FormData) {
  const { supabase, user } = await me();
  const projectId = String(formData.get("projectId") || "");
  if (!projectId) throw new Error("Missing project.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("saved_measurements")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("projects")
    .update({
      measurements: profile?.saved_measurements || {},
    })
    .eq("id", projectId)
    .eq("client_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/account/projects/${projectId}`);
}

export async function saveClientSettings(formData: FormData) {
  const { supabase, user } = await me();
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const deliveryAddress = String(formData.get("deliveryAddress") || "")
    .trim()
    .slice(0, 400);

  if (!fullName) throw new Error("Name cannot be empty.");
  if (!phone) throw new Error("Phone number is required so we can reach you.");

  const { data: existing } = await supabase
    .from("profiles")
    .select("style_preferences")
    .eq("id", user.id)
    .maybeSingle();

  const prefs = {
    ...((existing?.style_preferences as Record<string, unknown>) || {}),
    delivery_address: deliveryAddress || null,
  };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
      style_preferences: prefs,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/account", "layout");
}
