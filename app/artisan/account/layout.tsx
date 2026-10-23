import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/DashboardShell";

const ARTISAN_LINKS = [
  { href: "/artisan/account", label: "Dashboard", exact: true },
  { href: "/artisan/account#jobs", label: "My jobs" },
  { href: "/artisan/account#open", label: "Open jobs" },
  { href: "/artisan/account#open", label: "Jobs to claim" },
  { href: "/artisan/account/payouts", label: "Payouts" },
  { href: "/artisan/account/messages", label: "Messages" },
  { href: "/artisan/account/edit", label: "My profile" },
];

export const dynamic = "force-dynamic";

export default async function ArtisanAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "artisan") {
    redirect("/account");
  }

  return (
    <DashboardShell
      userName={profile?.full_name || ""}
      roleLabel="Artisan"
      links={ARTISAN_LINKS}
      promo={null}
      headerAction={{ href: "/artisan/account#open", label: "Jobs to claim" }}
      messagesHref="/artisan/account/messages"
    >
      {children}
    </DashboardShell>
  );
}
