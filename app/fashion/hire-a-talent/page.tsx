import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Hire a Talent — Hopayola",
  description:
    "Browse and hire individual tailors, designers, bead artisans and pattern drafters through Hopayola.",
};

export default function HireATalent() {
  return (
    <ComingSoon
      title="Hire a talent"
      description="Browse and hire individual tailors, designers, bead artisans and pattern drafters. This is opening first to our Abuja pilot."
      interest="hire_talent"
    />
  );
}