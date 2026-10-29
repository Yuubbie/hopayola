import type { Metadata } from "next";
import SeoArticle from "@/components/SeoArticle";

export const metadata: Metadata = {
  title: "Fashion artisan jobs in Nigeria",
  description:
    "Claim sewing jobs on Hopayola. Nationwide briefs, your shop address for pickup, 90 percent to the artisan when the client receives the outfit.",
  alternates: { canonical: "https://hopayola.com/artisan-jobs" },
};

export default function Page() {
  return (
    <SeoArticle
      title="Fashion artisan jobs in Nigeria"
      lede="Open briefs nationwide. You claim once. The job leaves the list so nobody else takes it."
      ctaHref="/artisan/sign-up"
      ctaLabel="Join as an artisan"
    >
      <p>
        Artisans on Hopayola see jobs on Fashion and on their dashboard. Claim
        is first come. After you claim, pack in the Hopayola box. The client
        sends GIG or Bolt to your shop. You do not need their home address.
      </p>
      <p>
        You are paid when the client marks the outfit received. Hopayola keeps
        10 percent. Sign up with business name, city, phone, and a recognised
        ID. No BVN or NIN number on the form.
      </p>
      <p>
        Already on the platform? Open Fashion, jobs to claim.
      </p>
    </SeoArticle>
  );
}
