import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Design My Outfit — Hopayola",
  description:
    "Share your measurements, references and occasion, and get guided design support from Hopayola.",
};

export default function DesignMyOutfit() {
  return (
    <ComingSoon
      title="Design my outfit"
      description="Share your measurements, references and occasion, and get guided design support from Hopayola."
      interest="design_outfit"
    />
  );
}