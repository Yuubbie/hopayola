"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProjectStatus(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const status = formData.get("status") as string;

  const supabase = await createClient();

  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/projects");
}