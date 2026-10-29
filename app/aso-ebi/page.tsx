import type { Metadata } from "next";
import SeoArticle from "@/components/SeoArticle";

export const metadata: Metadata = {
  title: "Aso ebi and occasion outfits",
  description:
    "Sew aso ebi and occasion outfits in Nigeria with Hopayola. Your fabric, a studio look, an artisan, payment held until delivery.",
  alternates: { canonical: "https://hopayola.com/aso-ebi" },
};

export default function Page() {
  return (
    <SeoArticle
      title="Aso ebi and occasion sewing"
      lede="Group fabric, a date, and a look that has to match. That is a project, not a chat thread."
      ctaHref="/projects/new"
      ctaLabel="Brief an aso ebi or occasion look"
    >
      <p>
        Aso ebi and owambe outfits fail when the fabric is late, the
        measurements are guessed, or nobody owns the timeline. On Hopayola you
        attach a measurement guide, send the cloth, and review stage photos
        before you book GIG or Bolt to collect.
      </p>
      <p>
        Use the design studio if you need a drawing from your fabric. Use my
        concept if you already have a picture. The artisan sews from that, not
        from a screenshot buried in WhatsApp.
      </p>
    </SeoArticle>
  );
}
