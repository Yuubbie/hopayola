import type { Metadata } from "next";

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
      "Real project breakdowns tracking a client's raw fabric photograph through the AI concept pipeline to the finished, delivered garment.",
  },
  {
    title: "Style Forecasts",
    description:
      "Our design engine synthesizes emerging African street style, occasionwear trends, and global contemporary influences.",
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
            Stories, style narratives, and cultural spotlights exploring contemporary African fashion, craftsmanship, and bespoke living.
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
              <p className="text-ink/70 leading-relaxed text-sm">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-stone/30 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-royal text-sm mb-4">Recreate the Look</p>
          <h2 className="font-display text-3xl md:text-4xl mb-6">
            Every feature starts your own project.
          </h2>
          <p className="text-ink/70 leading-relaxed mb-10">
            Every lifestyle feature links directly to the Hopayola Project Intake flow, allowing you to adopt featured silhouettes with your own yardage.
          </p>
          <a href="/projects/new" className="inline-block bg-royal text-paper px-6 py-3 rounded-full hover:bg-royal-deep transition-colors">
            Start a Project
          </a>
        </div>
      </section>
    </main>
  );
}