import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectIntakeForm from "@/components/project-intake-form";

export default async function NewProject() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, saved_measurements")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="font-display text-3xl mb-2">Start a project</h1>
      <p className="text-ink/60 mb-12">
        Tell us what you are making. We will use this to match you with the
        right team and generate design concepts.
      </p>

      <ProjectIntakeForm
        userId={user.id}
        savedMeasurements={profile?.saved_measurements ?? null}
      />
    </main>
  );
}