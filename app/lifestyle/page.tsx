import type { Metadata } from "next";
import Link from "next/link";
import ClientWardrobe from "@/components/ClientWardrobe";

export const metadata: Metadata = {
  title: "Lifestyle — Hopayola",
  description:
    "Your wardrobe of Hopayola projects, plus guides for living in the clothes you commission.",
};

export default function Lifestyle() {
  return (
    <main>
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-4xl px-6 md:px-10 py-24 md:py-32 text-center">
          <p className="text-royal text-sm mb-5 tracking-wide">Lifestyle</p>
          <h1 className="font-display text-4xl md:text-5xl mb-6 leading-tight">
            Wear your heritage. Keep every piece in one closet.
          </h1>
          <p className="text-paper/70 max-w-prose mx-auto leading-relaxed">
            Projects you run on Hopayola become wardrobe entries — in progress
            or finished — so the clothes you commission are never lost in chat.
          </p>
        </div>
      </section>

      <section
        id="wardrobe"
        className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28 scroll-mt-24"
      >
        <ClientWardrobe />
      </section>

      <section className="bg-stone/30">
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
          <p className="text-royal text-sm mb-4 text-center">Resources</p>
          <h2 className="font-display text-3xl md:text-4xl mb-4 text-center">
            Guides
          </h2>
          <p className="text-ink/65 leading-relaxed mb-14 text-center max-w-xl mx-auto">
            Measurement guide is free here. Sketch sheets and Little Artisans
            are in the shop.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <article className="bg-paper border border-stone rounded-2xl p-8 flex flex-col">
              <p className="text-xs uppercase tracking-widest text-royal mb-3">
                Free
              </p>
              <h3 className="font-display text-xl mb-3">Measurement guide</h3>
              <p className="text-ink/60 text-sm leading-relaxed mb-8 flex-1">
                Bust, waist, hip, height — before you brief an artisan.
              </p>
              <a
                href="/resources/measurement-guide.pdf"
                className="text-center bg-royal text-paper rounded-full py-3 text-sm hover:bg-royal-deep"
              >
                Download PDF
              </a>
            </article>
            <article className="bg-paper border border-stone rounded-2xl p-8 flex flex-col">
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">
                Shop
              </p>
              <h3 className="font-display text-xl mb-3">Croquis sheets</h3>
              <p className="text-ink/60 text-sm leading-relaxed mb-8 flex-1">
                Paid figure sheets. Buy on the shop — not a free file here.
              </p>
              <a
                href="https://shop.hopayola.com"
                className="text-center border border-ink/15 rounded-full py-3 text-sm hover:border-royal hover:text-royal"
              >
                Open shop
              </a>
            </article>
            <article className="bg-paper border border-stone rounded-2xl p-8 flex flex-col">
              <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">
                Shop
              </p>
              <h3 className="font-display text-xl mb-3">Little Artisans</h3>
              <p className="text-ink/60 text-sm leading-relaxed mb-8 flex-1">
                Paid booklet from the shop.
              </p>
              <a
                href="https://shop.hopayola.com"
                className="text-center border border-ink/15 rounded-full py-3 text-sm hover:border-royal hover:text-royal"
              >
                Open shop
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 md:px-10 py-20 md:py-28 text-center">
        <h2 className="font-display text-3xl md:text-4xl mb-6">
          Commission the next piece
        </h2>
        <p className="text-ink/65 leading-relaxed mb-10">
          Same sequence as always: fabric, one payment held, milestone reviews,
          then delivery into this wardrobe.
        </p>
        <Link
          href="/projects/new"
          className="inline-block bg-royal text-paper px-8 py-3.5 rounded-full hover:bg-royal-deep"
        >
          Start a project
        </Link>
      </section>
    </main>
  );
}
