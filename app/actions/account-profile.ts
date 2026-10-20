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

export async function saveClientSettings(formData: FormData) {
  const { supabase, user } = await me();
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const deliveryAddress = String(formData.get("deliveryAddress") || "")
    .trim()
    .slice(0, 400);

  if (!fullName) throw new Error("Name cannot be empty.");

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
