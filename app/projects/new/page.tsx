import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectIntakeForm from "@/components/project-intake-form";

export default async function NewProject({
  searchParams,
}: {
  searchParams: Promise<{ occasion?: string; tier?: string }>;
}) {
  const { occasion, tier } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, saved_measurements, role")
    .eq("id", user.id)
    .single();

  const home =
    profile?.role === "artisan"
      ? "/artisan/account"
      : profile?.role === "admin"
        ? "/admin"
        : "/account";

  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <p className="text-sm mb-6 flex flex-wrap gap-x-4 gap-y-1">
        <a href={home} className="text-royal hover:text-royal-deep">
          Back to dashboard
        </a>
        <a href="/" className="text-ink/50 hover:text-royal">
          Home
        </a>
        {profile?.role !== "artisan" && (
          <a href="/account/studio" className="text-ink/50 hover:text-royal">
            Design studio
          </a>
        )}
      </p>
      <p className="text-royal text-sm mb-2">Design studio</p>
      <h1 className="font-display text-3xl mb-2">Start a project</h1>
      <p className="text-ink/60 mb-12">
        Choose the look, then we draw concepts ({tier === "premium" ? "7" : "3"}{" "}
        on this package).
      </p>

      <ProjectIntakeForm
        userId={user.id}
        clientName={profile?.full_name ?? "Unknown"}
        clientEmail={user.email ?? "Unknown"}
        savedMeasurements={profile?.saved_measurements ?? null}
        initialOccasion={occasion ?? ""}
        initialTier={tier === "premium" ? "premium" : "standard"}
      />
    </main>
  );
}
