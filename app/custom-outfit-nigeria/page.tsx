import type { Metadata } from "next";
import SeoArticle from "@/components/SeoArticle";

export const metadata: Metadata = {
  title: "Custom outfit in Nigeria",
  description:
    "Commission a custom outfit in Nigeria. Brief the look, send fabric, a Hopayola artisan sews it. Payment is held until the garment is in your hands.",
  alternates: { canonical: "https://hopayola.com/custom-outfit-nigeria" },
};

export default function Page() {
  return (
    <SeoArticle
      title="Custom outfit in Nigeria, without chasing five people"
      lede="Hopayola is for people who want a garment sewn to their fabric and measurements, with one place for the brief, the artisan, and the money."
      ctaHref="/projects/new"
      ctaLabel="Start a custom project"
    >
      <p>
        A custom outfit in Nigeria usually means WhatsApp threads, a tailor you
        found through a cousin, and no clear moment when the work is done. We
        put that on one dashboard.
      </p>
      <p>
        You start a project, pick a look in the design studio (or upload your
        own concept), send fabric through GIG or Bolt, and pay once. Hopayola
        holds the money. The artisan is paid when you mark the outfit received.
      </p>
      <p>
        This is not a ready-to-wear mall. Ready-made goods sit on the shop.
        Sewing lives here.
      </p>
    </SeoArticle>
  );
}
