import Link from "next/link";

export default function ShopAndPilot() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 grid md:grid-cols-2 gap-8">
      <div className="bg-stone rounded-3xl p-10 flex flex-col justify-between">
        <div>
          <h3 className="font-display text-2xl mb-3">
            Free resources to get started
          </h3>
          <p className="text-ink/70 leading-relaxed mb-6">
            Measurement guides, planning worksheets and printable fashion
            resources, made to help you plan before you build.
          </p>
        </div>
        <Link
          href="https://shop.hopayola.com"
          className="text-royal hover:text-royal-deep transition-colors font-medium"
        >
          Visit the shop
        </Link>
      </div>

      <div className="bg-royal text-paper rounded-3xl p-10 flex flex-col justify-between">
        <div>
          <h3 className="font-display text-2xl mb-3">
            Currently piloting in Abuja
          </h3>
          <p className="text-paper/80 leading-relaxed mb-6">
            We're starting local, learning what works, and building toward
            other cities from there.
          </p>
        </div>
        <Link
          href="/about"
          className="text-paper underline underline-offset-4 hover:text-paper/70 transition-colors font-medium"
        >
          Learn about the pilot
        </Link>
      </div>
    </section>
  );
}
