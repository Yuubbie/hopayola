"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addShopWardrobeItem(formData: FormData) {
  const title = String(formData.get("title") || "").trim().slice(0, 120);
  const shopUrl = String(formData.get("shopUrl") || "").trim();
  if (!title) throw new Error("Name the piece.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in first.");

  const { error } = await supabase.from("wardrobe_shop_items").insert({
    client_id: user.id,
    title,
    shop_url: shopUrl || "https://shop.hopayola.com",
  });
  if (error) {
    throw new Error(
      "Could not save. Run wardrobe-points.sql on Hopayola Supabase, then try again."
    );
  }
  revalidatePath("/lifestyle");
}

export async function removeShopWardrobeItem(formData: FormData) {
  const id = String(formData.get("id") || "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  await supabase
    .from("wardrobe_shop_items")
    .delete()
    .eq("id", id)
    .eq("client_id", user.id);
  revalidatePath("/lifestyle");
}
