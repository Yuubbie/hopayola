import type { Metadata } from "next";
import SeoArticle from "@/components/SeoArticle";

export const metadata: Metadata = {
  title: "Custom wedding outfit Nigeria",
  description:
    "Commission a custom wedding or guest outfit in Nigeria. Hopayola artisans, fabric you send, payment held until the garment arrives.",
  alternates: { canonical: "https://www.hopayola.com/wedding-outfit" },
};

export default function Page() {
  return (
    <SeoArticle
      title="Custom wedding and guest outfits"
      lede="A wedding date does not move. The sewing has to."
      ctaHref="/projects/new"
      ctaLabel="Start a wedding project"
    >
      <p>
        Bridal and guest looks need a clear brief, fabric in the artisan’s
        hands, and reviews before the last week. Hopayola is built for that
        sequence: concept, fabric, held payment, stage photos, then you book
        collection.
      </p>
      <p>
        Premium on the studio is for bigger occasions when you want more drawn
        looks. Ready-made is the shop. A one-off wedding piece is a project.
      </p>
    </SeoArticle>
  );
}
