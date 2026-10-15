import DashboardPlaceholder from "@/components/DashboardPlaceholder";

export const metadata = { title: "Messages — Hopayola" };

export default function ArtisanMessagesPage() {
  return (
    <DashboardPlaceholder
      title="Messages"
      description="One inbox for every job, instead of opening each one to check for updates."
      points={[
        "For now, your conversation with the client and coordinator sits inside each job, under Messages and updates.",
        "This inbox will gather all of those threads with unread counts.",
        "Anything urgent about fabric or payment will also be emailed to you.",
      ]}
      backHref="/artisan/account"
      backLabel="Back to my jobs"
      secondary={null}
    />
  );
}
