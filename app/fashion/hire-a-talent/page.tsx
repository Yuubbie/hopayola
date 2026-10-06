import type { Metadata } from "next";
import FashionMarket from "@/components/FashionMarket";

export const metadata: Metadata = {
  title: "Hire a Talent — Hopayola",
  description:
    "Browse artisans available on Hopayola and start a coordinated project.",
};

export default function HireATalent() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-8">
        <h1 className="font-display text-4xl mb-3">Hire a talent</h1>
        <p className="text-ink/60 max-w-prose">
          Available artisans and open projects. Work stays on Hopayola.
        </p>
      </div>
      <FashionMarket />
    </main>
  );
}
