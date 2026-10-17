import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadInbox } from "@/lib/inbox";
import MessageInbox from "@/components/MessageInbox";

export const metadata = { title: "Messages — Hopayola" };
export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const rows = await loadInbox({
    viewerId: user.id,
    role: "admin",
    email: user.email,
  });

  return (
    <MessageInbox
      rows={rows}
      role="admin"
      emptyHint="No project has a conversation yet."
    />
  );
}
