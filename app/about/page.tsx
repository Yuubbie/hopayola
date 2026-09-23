import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Hopayola",
  description:
    "Hopayola transforms custom tailoring by connecting clients, curated artisans, and AI-driven design intelligence into a seamless bespoke ecosystem.",
};

export default function About() {
  return (
    <main>
      <section className="grid md:grid-cols-2 items-center">
        <div className="px-6 md:pl-10 md:pr-12 py-16 md:py-24">
          <p className="text-royal text-sm mb-4">About Hopayola</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-6">
            Bridging Traditional African Craftsmanship and Modern Fashion Tech.
          </h1>
          <p className="text-ink/70 text-lg leading-relaxed max-w-prose">
            Hopayola transforms custom tailoring by connecting clients,
            curated artisans, and AI-driven design intelligence into a
            seamless bespoke ecosystem.
          </p>
        </div>
        <div className="relative aspect-[4/5] md:aspect-auto md:h-full">
          <Image
            src="/images/marquee-4.jpg"
            alt="Hopayola fashion"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden order-2 md:order-1">
          <Image
            src="/images/marquee-1.jpg"
            alt="Hopayola fashion"
            fill
            className="object-cover"
          />
        </div>
        <div className="order-1 md:order-2">
          <p className="text-royal text-sm mb-4">Our Mission</p>
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Digital infrastructure for local fashion artisans.
          </h2>
          <p className="text-ink/70 leading-relaxed">
            To empower local fashion artisans and independent designers
            with digital infrastructure, guaranteed milestone payments, and
            intelligent production pipelines, while giving clients an
            effortless, reliable bespoke tailoring experience.
          </p>
        </div>
      </section>

      <section className="bg-stone/30 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-royal text-sm mb-4">The Problem We Solve</p>
          <h2 className="font-display text-3xl md:text-4xl mb-6">
            Bespoke fashion shouldn't feel unpredictable.
          </h2>
          <p className="text-ink/70 leading-relaxed max-w-prose mx-auto">
            Bespoke fashion across Africa often suffers from inconsistent
            communication, fit discrepancies, opaque pricing, and
            unpredictable delivery timelines. Hopayola solves this through
            structured AI design previews, verified artisan matching, and
            milestone-protected fulfillment.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-royal text-sm mb-4 text-center">
          How the Ecosystem Works
        </p>
        <h2 className="font-display text-3xl md:text-4xl mb-12 text-center">
          From fabric to finished piece.
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border border-stone rounded-2xl p-8">
            <h3 className="font-display text-xl mb-3">Intelligent Intake</h3>
            <p className="text-ink/70 leading-relaxed text-sm">
              Clients upload fabrics and select aesthetic profiles to
              generate tailored design concepts.
            </p>
          </div>
          <div className="border border-stone rounded-2xl p-8">
            <h3 className="font-display text-xl mb-3">
              Curated Craftsmanship
            </h3>
            <p className="text-ink/70 leading-relaxed text-sm">
              Projects match directly with verified master tailors,
              embellishers, and designers based on specialty and real-time
              capacity.
            </p>
          </div>
          <div className="border border-stone rounded-2xl p-8">
            <h3 className="font-display text-xl mb-3">Milestone Security</h3>
            <p className="text-ink/70 leading-relaxed text-sm">
              Every project is tracked from cutting to final hem, backed by
              secure milestone escrow.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ink text-paper py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-royal text-sm mb-4">Now piloting</p>
          <h2 className="font-display text-4xl md:text-5xl mb-6">
            Starting in Abuja
          </h2>
          <p className="text-paper/70 max-w-prose mx-auto leading-relaxed mb-10">
            We're launching local first, learning what works, and building
            toward other cities from there.
          </p>
          <Link
            href="/fashion"
            className="inline-block bg-royal text-paper px-6 py-3 rounded-full hover:bg-royal-deep transition-colors"
          >
            Explore Fashion
          </Link>
        </div>
      </section>
    </main>
  );
}