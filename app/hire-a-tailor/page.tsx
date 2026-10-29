import type { Metadata } from "next";
import SeoArticle from "@/components/SeoArticle";

export const metadata: Metadata = {
  title: "Hire a tailor in Nigeria",
  description:
    "Hire a tailor in Nigeria through Hopayola. Vetted artisans, held payment, your fabric, your measurements. Work stays on the platform.",
  alternates: { canonical: "https://www.hopayola.com/hire-a-tailor" },
};

export default function Page() {
  return (
    <SeoArticle
      title="Hire a tailor in Nigeria"
      lede="Find sewing talent without handing over your home address or paying into a personal account with no trail."
      ctaHref="/fashion"
      ctaLabel="See fashion and open jobs"
    >
      <p>
        Hopayola artisans join with a business name, city, phone, and a
        recognised ID. You do not hunt numbers on Instagram. You brief a
        project. An artisan claims it or the coordinator assigns one.
      </p>
      <p>
        You see the selected look and the measurement guide. They do not see
        your personal photos. Pickup is GIG or Bolt to their shop, so they do
        not need your house address.
      </p>
      <p>
        If you already know you want a custom piece, start a project. Fashion
        is where open briefs and available artisans sit.
      </p>
    </SeoArticle>
  );
}
