import DashboardPlaceholder from "@/components/DashboardPlaceholder";

export const metadata = { title: "Measurements — Hopayola" };

export default function MeasurementsPage() {
  return (
    <DashboardPlaceholder
      title="Measurements"
      description="Save your measurements once and stop typing them into every new project."
      points={[
        "We'll keep bust, waist, hip and height on your profile, plus any fit notes you add.",
        "New projects will pre-fill from here, and you can still override them per outfit.",
        "Whoever takes your measurements can update them, so the numbers stay current.",
      ]}
    />
  );
}
