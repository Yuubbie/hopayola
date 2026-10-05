import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lifestyle — Hopayola",
  description:
    "Stories, style narratives, and cultural spotlights exploring contemporary African fashion, craftsmanship, and bespoke living.",
};

const PILLARS = [
  {
    title: "The Artisan Ledger",
    description:
      "Deep dives into the workshops, heritage techniques, and personal stories of the master tailors, beadworkers, and craftspeople powering the platform.",
  },
  {
    title: "Silhouette & Fabric Guides",
    description:
      "Curated editorial advice on pairing native African prints, adire, silk, and brocade with modern functional cuts, workplace tailoring, and red-carpet aesthetics.",
  },
  {
    title: "From Concept to Closet",
    description:
      "Real project breakdowns tracking a client's fabric and brief through to the finished, delivered garment.",
  },
  {
    title: "Style Forecasts",
    description:
      "Occasionwear, street, and contemporary cuts — what people are actually sewing now.",
  },
];

export default function Lifestyle() {
  return (
    <main>
      <section className="bg-ink text-paper py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-royal text-sm mb-4">Royalty lies within</p>
          <h1 className="font-display text-4xl md:text-5xl mb-6">
            Wear Your Heritage, Cut to the Modern Moment.
          </h1>
          <p className="text-paper/70 max-w-prose mx-auto leading-relaxed">
            Stories, style narratives, and cultural spotlights exploring
            contemporary African fashion, craftsmanship, and bespoke living.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl md:text-4xl mb-12 text-center">
          Content Pillars
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="border border-stone rounded-2xl p-8">
              <h3 className="font-display text-xl mb-3">{pillar.title}</h3>
              <p className="text-ink/70 leading-relaxed text-sm">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="resources" className="scroll-mt-24 bg-stone/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-royal text-sm mb-4 text-center">Resources</p>
          <h2 className="font-display text-3xl md:text-4xl mb-4 text-center">
            Guides and worksheets
          </h2>
          <p className="text-ink/70 leading-relaxed mb-12 text-center max-w-2xl mx-auto">
            One starter guide is free. Sketch sheets and Little Artisans are
            sold in the Hopayola shop — not a public download.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <article className="bg-paper border border-stone rounded-2xl p-6 flex flex-col">
              <p className="text-xs uppercase tracking-widest text-royal mb-2">
                Free
              </p>
              <h3 className="font-display text-xl mb-2">Measurement guide</h3>
              <p className="text-ink/60 text-sm leading-relaxed mb-6 flex-1">
                How to take bust, waist, hip, and height before you start a
                project. Print it or keep it on your phone.
              </p>
              <a
                href="/resources/measurement-guide.pdf"
                className="text-center bg-royal text-paper rounded-full py-2.5 text-sm hover:bg-royal-deep"
              >
                Download PDF
              </a>
            </article>

            <article className="bg-paper border border-stone rounded-2xl p-6 flex flex-col">
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-2">
                Shop
              </p>
              <h3 className="font-display text-xl mb-2">
                Fashion croquis sketch sheets
              </h3>
              <p className="text-ink/60 text-sm leading-relaxed mb-6 flex-1">
                Printable figure sheets for sketching silhouettes. Paid — not
                included in the free starter pack.
              </p>
              <a
                href="https://shop.hopayola.com"
                className="text-center border border-ink/20 rounded-full py-2.5 text-sm hover:border-royal hover:text-royal"
              >
                Get it in the shop
              </a>
            </article>

            <article className="bg-paper border border-stone rounded-2xl p-6 flex flex-col">
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-2">
                Shop
              </p>
              <h3 className="font-display text-xl mb-2">Little Artisans</h3>
              <p className="text-ink/60 text-sm leading-relaxed mb-6 flex-1">
                Paid booklet. Buy from the shop — it is not a free download on
                this site.
              </p>
              <a
                href="https://shop.hopayola.com"
                className="text-center border border-ink/20 rounded-full py-2.5 text-sm hover:border-royal hover:text-royal"
              >
                Get it in the shop
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-royal text-sm mb-4">Recreate the Look</p>
          <h2 className="font-display text-3xl md:text-4xl mb-6">
            Every feature starts your own project.
          </h2>
          <p className="text-ink/70 leading-relaxed mb-10">
            Use the free measurement guide, then send a brief — with or without
            photos.
          </p>
          <Link
            href="/projects/new"
            className="inline-block bg-royal text-paper px-6 py-3 rounded-full hover:bg-royal-deep transition-colors"
          >
            Start a Project
          </Link>
        </div>
      </section>
    </main>
  );
}
