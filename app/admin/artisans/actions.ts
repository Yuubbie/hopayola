"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

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

  if (verified) {
    const service = createServiceClient();
    const { data: person } = await service
      .from("profiles")
      .select("full_name")
      .eq("id", artisanId)
      .maybeSingle();
    const { data: authUser } = await service.auth.admin.getUserById(artisanId);
    const to = authUser.user?.email;
    if (to) {
      const { emailArtisanVerified } = await import("@/app/actions/notifications");
      await emailArtisanVerified(person?.full_name || "", to);
    }
  }
}

export async function rejectArtisanId(formData: FormData) {
  const artisanId = String(formData.get("artisanId") || "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in.");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("Admin only.");

  const service = createServiceClient();
  const { error } = await service
    .from("artisan_profiles")
    .update({ id_document_path: null, verified: false })
    .eq("id", artisanId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/artisans");
}
