import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Hopayola",
  description:
    "Hopayola is building a network that connects people with fashion creatives and artisans, starting with our Abuja pilot.",
};

export default function About() {
  return (
    <main>
      <section className="grid md:grid-cols-2 items-center">
        <div className="px-6 md:pl-10 md:pr-12 py-16 md:py-24">
          <p className="text-royal text-sm mb-4">About Hopayola</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-6">
            Fashion, planned and coordinated, not just found.
          </h1>
          <p className="text-ink/70 text-lg leading-relaxed max-w-prose">
            Hopayola is building a network that connects people with fashion
            creatives and artisans. Rather than being another place to find
            a tailor, we help plan and coordinate the creation of your
            fashion project, from first idea to final delivery.
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
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Not a directory. A coordinator.
          </h2>
          <p className="text-ink/70 leading-relaxed mb-4">
            Most platforms stop at helping you find a tailor. We go
            further, planning the project alongside you: measurements,
            fabric, design, and every milestone in between, so you're not
            left managing five different people on your own.
          </p>
          <p className="text-ink/70 leading-relaxed">
            Whether you work with one professional directly or let us
            assemble and coordinate a full team, you'll always know
            exactly where your project stands.
          </p>
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