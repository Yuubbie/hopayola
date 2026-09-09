import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Create a Team — Hopayola",
  description:
    "Let Hopayola assemble and coordinate the right fashion professionals for your project.",
};

export default function CreateATeam() {
  return (
    <ComingSoon
      title="Create a team"
      description="Our premium offering: Hopayola assembles and coordinates the right people for your project, so you don't have to manage everyone yourself."
      interest="create_team"
    />
  );
}