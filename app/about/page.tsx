import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Hopayola",
  description:
    "Hopayola is building a network that connects people with fashion creatives and artisans, starting with our Abuja pilot.",
};

export default function About() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="font-display text-4xl mb-6">About Hopayola</h1>
      <p className="text-ink/70 leading-relaxed mb-6">
        Hopayola is building a network that connects people with fashion
        creatives and artisans. Rather than being another place to find a
        tailor, we help plan and coordinate the creation of your fashion
        project, from first idea to final delivery.
      </p>
      <p className="text-ink/70 leading-relaxed">
        We're currently piloting in Abuja, learning what works before
        expanding further.
      </p>
    </main>
  );
}