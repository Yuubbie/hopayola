import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Account() {
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

  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="font-display text-3xl mb-2">
        Hello, {profile?.full_name || "there"}
      </h1>
      <p className="text-ink/60 mb-12">
        Your project dashboard is coming soon. For now, here's what's on
        file.
      </p>

      <div className="space-y-6">
        <section className="border border-stone rounded-2xl p-6">
          <h2 className="font-display text-lg mb-4">Your details</h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between">
              <dt className="text-ink/50">Name</dt>
              <dd>{profile?.full_name || "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Email</dt>
              <dd>{user.email}</dd>
            </div>
          </dl>
        </section>

        <section className="border border-stone rounded-2xl p-6">
          <h2 className="font-display text-lg mb-2">Saved measurements</h2>
          <p className="text-ink/50 text-sm">
            You haven't added any measurements yet.
          </p>
        </section>

        <section className="border border-stone rounded-2xl p-6">
          <h2 className="font-display text-lg mb-2">Order history</h2>
          <p className="text-ink/50 text-sm">
            Purchases from the shop will appear here.
          </p>
        </section>
      </div>
    </main>
  );
}
