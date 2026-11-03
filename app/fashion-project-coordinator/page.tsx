import type { Metadata } from "next";
import Link from "next/link";
import SeoArticle from "@/components/SeoArticle";

export const metadata: Metadata = {
  title: "Fashion project coordinator Nigeria",
  description:
    "Hopayola coordinates custom fashion projects in Nigeria: client brief, fabric, vetted artisans, held payment. Not a job board. Hire a tailor or join as an artisan.",
  alternates: {
    canonical: "https://hopayola.com/fashion-project-coordinator",
  },
};

export default function Page() {
  return (
    <SeoArticle
      title="Fashion project coordinator in Nigeria"
      lede="Hopayola is the coordinator between the client and the artisan. One brief, one dashboard, money held until the outfit is in your hands."
      ctaHref="/projects/new"
      ctaLabel="Start a custom project"
    >
      <p>
        People search for a fashion project manager, a fashion artisan manager,
        or a custom clothing coordination app. What they usually need is not
        another WhatsApp group. They need someone who owns the sequence.
      </p>
      <p>
        Hopayola does that for custom outfits in Nigeria. You brief the look.
        You send fabric. A verified fashion artisan sews it. You review stage
        photos. You book GIG or Bolt to collect from their shop. We do not
        store your home address. The artisan is paid when you mark received.
      </p>
      <p>
        This is a bespoke fashion studio on the web, not a job listing for
        “client manager.” We are not hiring a middleman for you. The platform
        is the coordinator.
      </p>
      <p>
        Traditional and cultural wear, aso ebi, party gowns, wedding guest
        looks: same flow. Hire fashion designers and tailors in Abuja and
        nationwide through a project, not a personal number.
      </p>
      <p>
        Artisans: this is a tailoring job platform only in the sense that you
        claim open briefs. You keep 90 percent. Sign up with business name,
        city, phone, and a recognised ID.
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <Link href="/custom-outfit-nigeria" className="text-royal">
            Custom outfit in Nigeria
          </Link>
        </li>
        <li>
          <Link href="/hire-a-tailor" className="text-royal">
            Hire a tailor
          </Link>
        </li>
        <li>
          <Link href="/aso-ebi" className="text-royal">
            Aso ebi and occasion sewing
          </Link>
        </li>
        <li>
          <Link href="/wedding-outfit" className="text-royal">
            Wedding outfit
          </Link>
        </li>
        <li>
          <Link href="/artisan-jobs" className="text-royal">
            Artisan jobs
          </Link>
        </li>
      </ul>
    </SeoArticle>
  );
}
