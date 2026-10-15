import DashboardPlaceholder from "@/components/DashboardPlaceholder";

export const metadata = { title: "Saved items — Hopayola" };

export default function SavedPage() {
  return (
    <DashboardPlaceholder
      title="Saved items"
      description="Keep the looks you love in one place, then turn any of them into a project."
      points={[
        "Save designs, fabrics and styles you come across while browsing.",
        "Bring them back later and start a project from what you saved.",
        "Your wardrobe on the Wardrobe page is separate — that one holds what we have already made for you.",
      ]}
    />
  );
}
