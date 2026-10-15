import Link from "next/link";
import DashboardPlaceholder from "@/components/DashboardPlaceholder";

export const metadata = { title: "Messages — Hopayola" };

export default function MessagesPage() {
  return (
    <DashboardPlaceholder
      title="Messages"
      description="One inbox for everything about your projects, instead of digging through each one."
      points={[
        "Right now your conversation with the team lives inside each project, under Messages and updates.",
        "This inbox will pull every thread together, with unread counts and file attachments.",
        "Until then, open a project to talk to your coordinator or artisan.",
      ]}
    />
  );
}
