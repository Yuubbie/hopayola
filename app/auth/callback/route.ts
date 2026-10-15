import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  let next = searchParams.get("next") ?? "/account";
  if (!next.startsWith("/")) next = "/account";
  if (type === "recovery") next = "/reset-password";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return finish(origin, next, supabase);
    }
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return finish(origin, next, supabase);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=confirmation_failed`);
}

async function finish(
  origin: string,
  next: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (next !== "/reset-password" && user?.user_metadata?.intended_role === "artisan") {
    const metadata = user.user_metadata;

    await supabase.from("profiles").update({ role: "artisan" }).eq("id", user.id);

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

    return NextResponse.redirect(`${origin}/artisan/account?welcome=1`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
