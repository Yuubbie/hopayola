import type { Metadata } from "next";
import FashionPathways from "@/components/FashionPathways";
import FashionMarket from "@/components/FashionMarket";

export const metadata: Metadata = {
  title: "Fashion — Hopayola",
  description:
    "Hire a fashion talent, create a team, or join as an artisan. Explore the ways to work with Hopayola.",
};

export default function Fashion() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-4">
        <h1 className="font-display text-4xl mb-3">Fashion</h1>
        <p className="text-ink/60 max-w-prose">
          Artisans available to start, and projects open to claim.
        </p>
      </div>
      <FashionPathways />
      <FashionMarket />
    </main>
  );
}
