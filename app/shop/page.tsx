import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shop ready-made goods and design guides",
  description:
    "Buy Hopayola guides, worksheets, and ready-made apparel at shop.hopayola.com. Custom garments still start in the design studio.",
};

const STORE = "https://shop.hopayola.com";

const goods = [
  {
    label: "Free here",
    title: "Measurement guide",
    body: "Bust, waist, hip, height. Use this before you brief an artisan.",
    href: "/resources/measurement-guide.pdf",
    cta: "Download PDF",
    paid: false,
  },
  {
    label: "In the store",
    title: "Croquis sheets",
    body: "Paid figure sheets for sketching looks before you commission.",
    href: STORE,
    cta: "Buy in the store",
    paid: true,
  },
  {
    label: "In the store",
    title: "Little Artisans",
    body: "Paid booklet from the Hopayola store.",
    href: STORE,
    cta: "Buy in the store",
    paid: true,
  },
];

export default function ShopPage() {
  return (
    <main>
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-4xl px-6 md:px-10 py-24 md:py-32 text-center">
          <h1 className="font-display text-4xl md:text-5xl mb-6 leading-tight">
            Ready-made from Hopayola.
          </h1>
          <p className="text-paper/70 max-w-prose mx-auto leading-relaxed">
            Curated goods and guides, shipped straight to your doorstep. Prefer
            something one-of-a-kind? Head over to the design studio to brief an
            artisan for a custom piece.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <a
              href={STORE}
              className="bg-royal text-paper rounded-full px-6 py-2.5 text-sm hover:bg-royal-deep transition-colors"
            >
              Open the store
            </a>
            <Link
              href="/account/studio"
              className="border border-paper/30 text-paper rounded-full px-6 py-2.5 text-sm hover:border-paper transition-colors"
            >
              Design studio
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
        <h2 className="font-display text-3xl mb-3">Creative Tools &amp; Guides</h2>
        <p className="text-ink/60 text-sm mb-10 max-w-xl">
          Download instant worksheets, coloring books, and design templates to
          spark your next project, or complete your checkout for ready-made
          apparel over at shop.hopayola.com.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {goods.map((item) => (
            <article
              key={item.title}
              className="border border-stone rounded-2xl p-8 flex flex-col"
            >
              <p className="text-xs uppercase tracking-widest text-royal mb-3">
                {item.label}
              </p>
              <h3 className="font-display text-xl mb-3">{item.title}</h3>
              <p className="text-ink/60 text-sm leading-relaxed mb-8 flex-1">
                {item.body}
              </p>
              {item.paid ? (
                <a
                  href={item.href}
                  className="text-center border border-ink/15 rounded-full py-3 text-sm hover:border-royal hover:text-royal"
                >
                  {item.cta}
                </a>
              ) : (
                <a
                  href={item.href}
                  className="text-center bg-royal text-paper rounded-full py-3 text-sm hover:bg-royal-deep"
                >
                  {item.cta}
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="bg-stone/30">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl mb-4">Need a Custom Garment?</h2>
          <p className="text-ink/65 leading-relaxed mb-8">
            This lives outside the shop. Start a project, send your fabric,
            choose a concept from the ai design studio, and watch an artisan
            bring it to life, with Hopayola coordinating your project until
            it&apos;s safely in your hands.
          </p>
          <Link
            href="/projects/new"
            className="inline-block bg-royal text-paper rounded-full px-6 py-2.5 text-sm hover:bg-royal-deep"
          >
            Start a project
          </Link>
        </div>
      </section>
    </main>
  );
}
