import DashboardPlaceholder from "@/components/DashboardPlaceholder";

export const metadata = { title: "Settings — Hopayola" };

export default function SettingsPage() {
  return (
    <DashboardPlaceholder
      title="Settings"
      description="Your account details, contact information and preferences, in one place."
      points={[
        "Name, phone number and delivery address for projects.",
        "Notification choices, so you only hear from us when something needs you.",
        "Password and sign-in options.",
      ]}
    />
  );
}
