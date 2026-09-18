"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setArtisanVerified(formData: FormData) {
  const artisanId = formData.get("artisanId") as string;
  const verified = formData.get("verified") === "true";

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("artisan_profiles")
    .update({ verified })
    .eq("id", artisanId)
    .select();

  if (error) {
    throw new Error(`Could not update artisan: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error("Update was blocked - check permissions.");
  }

  revalidatePath("/admin/artisans");
}