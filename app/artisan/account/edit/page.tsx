import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ArtisanProfileEditForm from "@/components/artisan-profile-edit-form";

export default async function EditArtisanProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "artisan") {
    redirect("/account");
  }

  const { data: artisanProfile } = await supabase
    .from("artisan_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="font-display text-3xl mb-2">Edit your profile</h1>
      <p className="text-ink/60 mb-12">
        Update your details so clients and the matching system have the
        right picture of your work.
      </p>

      <ArtisanProfileEditForm
        userId={user.id}
        initialFullName={profile?.full_name || ""}
        initialAvailability={artisanProfile?.availability_status || "unavailable"}
        initialSpecialty={artisanProfile?.specialty || []}
        initialSkills={(artisanProfile?.skills || []).join(", ")}
        initialYearsExperience={artisanProfile?.years_experience?.toString() || ""}
        initialBio={artisanProfile?.bio || ""}
      />
    </main>
  );
}