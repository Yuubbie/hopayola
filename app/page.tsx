import Hero from "@/components/Hero";
import FashionPathways from "@/components/FashionPathways";
import OccasionBrowse from "@/components/OccasionBrowse";
import ProcessStrip from "@/components/ProcessStrip";
import ShopAndPilot from "@/components/ShopAndPilot";
import WelcomeModal from "@/components/WelcomeModal";
import WaitlistSignup from "@/components/WaitlistSignup";

export default function Home() {
  return (
    <main>
      <WelcomeModal />
      <Hero />
      <FashionPathways />
      <OccasionBrowse />
      <ProcessStrip />
      <ShopAndPilot />
      <WaitlistSignup />
    </main>
  );
}