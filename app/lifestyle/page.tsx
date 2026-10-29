import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lifestyle - Hopayola",
  description: "Hopayola Lifestyle is coming soon.",
};

export default function Lifestyle() {
  return (
    <main>
      <section className="bg-ink text-paper min-h-[70vh] flex items-center">
        <div className="mx-auto max-w-2xl px-6 md:px-10 py-24 md:py-32 text-center">
          <h1 className="font-display text-4xl md:text-5xl mb-6 leading-tight">
            Coming soon
          </h1>
          <p className="text-paper/70 leading-relaxed">
            Wardrobe, guides, and the rest of Lifestyle are not live yet. We
            will open this when it is ready.
          </p>
        </div>
      </section>
    </main>
  );
}
