import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadInbox } from "@/lib/inbox";
import MessageInbox from "@/components/MessageInbox";

export const metadata = { title: "Messages — Hopayola" };
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const rows = await loadInbox({
    viewerId: user.id,
    role: "client",
    email: user.email,
  });

  return (
    <MessageInbox
      rows={rows}
      role="client"
      emptyHint="Once you start a project, everything you discuss with the team lands here."
    />
  );
}
