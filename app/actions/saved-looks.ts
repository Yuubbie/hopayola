"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveLook(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in first.");

  const title = String(formData.get("title") || "Saved look").slice(0, 120);
  const imageUrl = String(formData.get("imageUrl") || "");
  const projectId = String(formData.get("projectId") || "") || null;
  const conceptId = String(formData.get("conceptId") || "") || null;

  if (!imageUrl) throw new Error("Nothing to save.");

  const { error } = await supabase.from("saved_looks").insert({
    client_id: user.id,
    title,
    image_url: imageUrl,
    project_id: projectId,
    concept_id: conceptId,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/account/saved");
}

export async function deleteSavedLook(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in first.");

  const id = String(formData.get("id") || "");
  const { error } = await supabase
    .from("saved_looks")
    .delete()
    .eq("id", id)
    .eq("client_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/account/saved");
}
