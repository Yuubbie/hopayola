import Hero from "@/components/Hero";
import FashionPathways from "@/components/FashionPathways";
import OccasionBrowse from "@/components/OccasionBrowse";
import ProcessStrip from "@/components/ProcessStrip";
import ShopAndPilot from "@/components/ShopAndPilot";
import PlatformStory from "@/components/PlatformStory";
import WelcomeModal from "@/components/WelcomeModal";

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
