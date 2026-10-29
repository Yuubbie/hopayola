import type { Metadata } from "next";
import Hero from "@/components/Hero";
import FashionPathways from "@/components/FashionPathways";
import OccasionBrowse from "@/components/OccasionBrowse";
import ProcessStrip from "@/components/ProcessStrip";
import ShopAndPilot from "@/components/ShopAndPilot";
import PlatformStory from "@/components/PlatformStory";
import WelcomeModal from "@/components/WelcomeModal";

export const metadata: Metadata = {
  description:
    "Find a tailor in Nigeria without WhatsApp chaos. Brief your look, send fabric, an artisan sews it. Hopayola holds the money until it is in your hands.",
};

export default function Home() {
  return (
    <main>
      <WelcomeModal />
      <Hero />
      <PlatformStory />
      <FashionPathways />
      <OccasionBrowse />
      <ProcessStrip />
      <ShopAndPilot />
    </main>
  );
}
