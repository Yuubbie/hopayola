import DashboardPlaceholder from "@/components/DashboardPlaceholder";

export const metadata = { title: "Payouts — Hopayola" };

export default function ArtisanPayoutsPage() {
  return (
    <DashboardPlaceholder
      title="Payouts"
      description="Every stage you have been paid for, and what is still on the way."
      points={[
        "You are paid per stage, once the client approves the photo you send.",
        "This page will list each payout with the date, the amount and the project it belongs to.",
        "Keep your bank details up to date under My profile so payouts never stall.",
      ]}
      backHref="/artisan/account"
      backLabel="Back to my jobs"
      secondary={{ href: "/artisan/account/edit", label: "Bank details" }}
    />
  );
}
