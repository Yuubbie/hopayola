import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/DashboardShell";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/projects", label: "All projects" },
  { href: "/admin/artisans", label: "Artisans" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin#confirm", label: "Payments to confirm" },
  { href: "/admin#verify", label: "Artisans to verify" },
];

export const dynamic = "force-dynamic";

export default async function AdminLayout({
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

  if (profile?.role !== "admin") {
    redirect("/account");
  }

  return (
    <DashboardShell
      userName={profile?.full_name || ""}
      roleLabel="Coordinator"
      links={ADMIN_LINKS}
      promo={null}
      headerAction={{ href: "/admin/projects", label: "All projects" }}
      messagesHref={null}
    >
      {children}
    </DashboardShell>
  );
}
