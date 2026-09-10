import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.user_metadata?.intended_role === "artisan") {
        const metadata = user.user_metadata;

        await supabase
          .from("profiles")
          .update({ role: "artisan" })
          .eq("id", user.id);

        await supabase.from("artisan_profiles").upsert({
          id: user.id,
          region: metadata.artisan_region || "abuja",
          specialty: metadata.artisan_specialty
            ? String(metadata.artisan_specialty).split(",").filter(Boolean)
            : [],
          skills: metadata.artisan_skills
            ? String(metadata.artisan_skills).split(",").filter(Boolean)
            : [],
          years_experience: metadata.artisan_years_experience
            ? Number(metadata.artisan_years_experience)
            : null,
          bio: metadata.artisan_bio || null,
        });

        return NextResponse.redirect(`${origin}/account?welcome=artisan`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=confirmation_failed`);
}