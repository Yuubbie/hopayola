import Hero from "@/components/Hero";
import FashionPathways from "@/components/FashionPathways";
import ProcessStrip from "@/components/ProcessStrip";
import ShopAndPilot from "@/components/ShopAndPilot";
import WelcomeModal from "@/components/WelcomeModal";

export default function Home() {
  return (
    <main>
      <WelcomeModal />
      <Hero />
      <FashionPathways />
      <ProcessStrip />
      <ShopAndPilot />
    </main>
  );
}